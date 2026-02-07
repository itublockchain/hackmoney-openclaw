
import type { Request, Response } from 'express';
import {
    createPublicClient,
    http,
    encodeAbiParameters,
    decodeAbiParameters,
    keccak256,
    stringToBytes,
    encodePacked,
    type Address,
    type Hex
} from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import config from '@/config';
import AgentService from '@/services/AgentService';

export class ENSController {

    // CCIP-Read: GET /api/v1/ens-gateway/{sender}/{data}.json
    static async handleCCIPRead(req: Request, res: Response) {
        const { sender, data } = req.params;

        try {
            if (!config.L2_SUBDOMAIN_REGISTRY_ADDRESS) {
                throw new Error("L2_SUBDOMAIN_REGISTRY_ADDRESS not configured");
            }
            if (!config.RELAYER_PRIVATE_KEY) {
                throw new Error("RELAYER_PRIVATE_KEY not configured");
            }

            const dataStr = data as string;
            console.log(`[ENS-Gateway] Query from ${sender}`);
            console.log(`[ENS-Gateway] Raw Data: ${dataStr.slice(0, 130)}...`);

            // Decode input: name (bytes), data (bytes)
            const decoded = decodeAbiParameters(
                [{ type: 'bytes' }, { type: 'bytes' }],
                `0x${dataStr.slice(10)}` as Hex
            );

            const dnsName = decoded[0];
            const innerCallData = decoded[1];

            console.log(`[ENS-Gateway] Raw DNS Name: ${dnsName}`);

            // Decode DNS Name to string
            // Basic DNS decode logic manually using Buffer
            let pointer = 0;
            const buffer = Buffer.from(dnsName.slice(2), 'hex');

            const labels: string[] = [];
            while (pointer < buffer.length && buffer[pointer] !== 0) {
                const length = buffer[pointer];
                if (length === undefined) break;
                pointer++;
                const label = buffer.slice(pointer, pointer + length).toString('utf8');
                labels.push(label);
                pointer += length;
            }
            // labels example: ['batikan', 'moltlancer', 'eth']
            const fullDomain = labels.join('.');
            const subdomain = labels[0] || '';
            const parentLabel = config.L2_ENS_NAME.split('.')[0];
            const isParent = labels.length <= 2;
            const isReverse = fullDomain.endsWith('addr.reverse');

            console.log(`[ENS-Gateway] Resolving: ${fullDomain} (Subdomain: ${subdomain}, isParent: ${isParent}, isReverse: ${isReverse})`);
            console.log(`[ENS-Gateway] Inner Call Selector: ${innerCallData.slice(0, 10)}`);

            let resultData: Hex;

            if (isReverse) {
                // Reverse Resolution: [address].addr.reverse
                // subdomain is the address hex (without 0x usually)
                const addressToReverse = subdomain.startsWith('0x') ? subdomain : `0x${subdomain}`;
                console.log(`[ENS-Gateway] Reverse Lookup for: ${addressToReverse}`);

                const name = await AgentService.getPrimaryNameForAddress(addressToReverse);

                if (name) {
                    const fullName = `${name}.${config.L2_ENS_NAME}`;
                    console.log(`[ENS-Gateway] Found Reverse Name: ${fullName}`);
                    // Return as ABI encoded string for name(bytes32)
                    resultData = encodeAbiParameters([{ type: 'string' }], [fullName]);
                } else {
                    console.log(`[ENS-Gateway] No reverse record found for ${addressToReverse}`);
                    resultData = encodeAbiParameters([{ type: 'string' }], ['']);
                }
            } else if (isParent && subdomain === parentLabel) {
                // ... rest of the logic
                console.log(`[ENS-Gateway] Returning null for parent domain resolution.`);
                resultData = encodeAbiParameters([{ type: 'address' }], ['0x0000000000000000000000000000000000000000']);
            } else {
                const client = createPublicClient({
                    chain: base,
                    transport: http(config.RPC_URL)
                });

                const l2RegistryParam = config.L2_SUBDOMAIN_REGISTRY_ADDRESS as Address;
                const labelHash = keccak256(stringToBytes(subdomain as string));

                const owner = await client.readContract({
                    address: l2RegistryParam,
                    abi: [{
                        name: "domains",
                        type: "function",
                        inputs: [{ type: "bytes32", name: "" }],
                        outputs: [{ type: "address", name: "" }]
                    }],
                    functionName: "domains",
                    args: [labelHash]
                }) as Address;

                const resolvedAddress = owner;
                console.log(`[ENS-Gateway] L2 Owner: ${resolvedAddress}`);

                // 3. Construct Response
                if (innerCallData.startsWith('0x3b3b57de')) {
                    // addr(bytes32)
                    resultData = encodeAbiParameters([{ type: 'address' }], [resolvedAddress]);
                } else if (innerCallData.startsWith('0x69135755')) {
                    // name(bytes32) - also support reverse on any domain if needed, 
                    // but usually it's addr.reverse
                    const name = await AgentService.getPrimaryNameForAddress(resolvedAddress);
                    resultData = encodeAbiParameters([{ type: 'string' }], [name ? `${name}.${config.L2_ENS_NAME}` : '']);
                } else {
                    resultData = '0x';
                }
            }


            // 4. Sign the Response
            const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour validity

            // Expected Hash Structure for EIP-1900 / OffchainLookup:
            // keccak256(abi.encodePacked(
            //   hex"1900",
            //   resolverAddress, 
            //   validUntil,
            //   keccak256(innerCallData), // Match OffchainResolver.sol:L81
            //   keccak256(result)
            // ))

            const messageDigest = keccak256(
                encodePacked(
                    ['bytes', 'address', 'uint64', 'bytes32', 'bytes32'],
                    [
                        '0x1900' as Hex,
                        sender as Address, // This is the 'sender' (resolver address) passed in URL
                        validUntil,
                        keccak256(innerCallData),
                        keccak256(resultData)
                    ]
                )
            );

            // Sign
            let privateKey = config.RELAYER_PRIVATE_KEY.trim();
            if (!privateKey.startsWith('0x')) {
                privateKey = `0x${privateKey}`;
            }
            const account = privateKeyToAccount(privateKey as Hex);

            // We use sign({ hash }) to sign the raw digest. 
            // This produces a recoverable signature (r,s,v)
            const signature = await account.sign({
                hash: messageDigest
            });

            // 5. Encode the final response for CCIP-Read
            // The contract expects: abi.decode(response, (bytes, uint64, bytes))
            const responseData = encodeAbiParameters(
                [{ type: 'bytes' }, { type: 'uint64' }, { type: 'bytes' }],
                [resultData, validUntil, signature]
            );

            console.log(`[ENS-Gateway] Final Response Data Size: ${responseData.length} chars`);

            res.json({ data: responseData });

        } catch (error) {
            console.error("[ENS-Gateway] Error:", error);
            res.status(500).json({ message: "Gateway error" });
        }
    }
}
