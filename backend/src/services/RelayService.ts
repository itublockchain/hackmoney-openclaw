import config from '../config';
import { createPublicClient, createWalletClient, http, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export class RelayService {

    private publicClient;

    constructor() {
        this.publicClient = createPublicClient({
            chain: {
                id: config.CHAIN_ID,
                name: "Base",
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                rpcUrls: {
                    default: { http: [config.RPC_URL] },
                    public: { http: [config.RPC_URL] },
                },
            } as any,
            transport: http(config.RPC_URL)
        });
    }

    /**
     * Relays an EIP-7702 transaction using Cast.
     */
    async relayWithCast(params: {
        to: Address,
        rawAuthHex: string,
        data?: Hex
    }) {
        // Falling back to legacy cast directly as CDP SDK is removed
        return this.relayWithCastLegacy(params);
    }


    /**
     * Sends a standard transaction using the configured private key.
     * Useful for backend administrative actions (like minting subdomains).
     */
    async sendTransaction(params: {
        to: Address,
        data: Hex,
        value?: bigint
    }) {
        let relayerKey = config.RELAYER_PRIVATE_KEY;
        if (!relayerKey) throw new Error("RELAYER_PRIVATE_KEY missing");

        // Ensure 0x prefix
        relayerKey = relayerKey.trim().replace(/^["']|["']$/g, '');
        if (!relayerKey.startsWith('0x')) {
            relayerKey = `0x${relayerKey}`;
        }

        const chain = {
            id: config.CHAIN_ID,
            name: "Base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
                default: { http: [config.RPC_URL] },
                public: { http: [config.RPC_URL] },
            },
        } as any;

        const account = privateKeyToAccount(relayerKey as Hex);
        const walletClient = createWalletClient({
            account,
            chain,
            transport: http(config.RPC_URL)
        });

        console.log(`[RelayService] 🚀 Sending Admin Tx via Viem (from: ${account.address})...`);

        try {
            // Viem handles gas estimation and gas price automatically
            const hash = await walletClient.sendTransaction({
                to: params.to,
                data: params.data,
                value: params.value || 0n,
                chain,
                // Explicitly set a gas limit to avoid over-estimation by 'cast' or RPC
                // A registry call is usually ~100k-150k gas. 500k is safe.
                gas: 500000n,
            });

            console.log(`[RelayService] Tx Hash: ${hash}`);

            // Wait for confirmation
            const receipt = await this.publicClient.waitForTransactionReceipt({
                hash,
                confirmations: 1
            });

            if (receipt.status === 'reverted') {
                throw new Error(`Transaction reverted on-chain: ${hash}`);
            }

            console.log(`[RelayService] ${hash} confirmed.`);
            return hash;
        } catch (e: any) {
            console.error('[RelayService] sendTransaction failed:', e.message);
            throw e;
        }
    }

    /**
     * Legacy Cast Implementation (Robust)
     */
    private async relayWithCastLegacy(params: {
        to: Address,
        rawAuthHex: string,
        data?: Hex
    }) {
        const { execSync } = require('child_process');
        let relayerKey = config.RELAYER_PRIVATE_KEY;

        if (!relayerKey) throw new Error("RELAYER_PRIVATE_KEY missing for legacy cast fallback");

        // Ensure 0x prefix and clean the key
        relayerKey = relayerKey.trim().replace(/^["']|["']$/g, '');
        if (!relayerKey.startsWith('0x')) {
            relayerKey = `0x${relayerKey}`;
        }

        const rpcUrl = config.RPC_URL;

        // Log balance before sending
        try {
            const balance = await this.publicClient.getBalance({ address: privateKeyToAccount(relayerKey as Hex).address });
            console.log(`[RelayService] Relayer Balance: ${Number(balance) / 1e18} ETH`);
        } catch (balErr) {
            console.warn("[RelayService] Failed to fetch relayer balance:", balErr);
        }

        let target = params.to;
        let dataArg = params.data || '0x';

        // IMPROVED PATTERN: If data is empty/0x, use Zero Address as target (Carrier Transaction)
        // This follows `cast send $(cast az) --auth ...`
        if (!dataArg || dataArg === '0x' || (dataArg as string) === '') {
            target = '0x0000000000000000000000000000000000000000';
            dataArg = '0x';
        }

        const command = `cast send ${target} ${dataArg} --private-key ${relayerKey} --auth ${params.rawAuthHex} --rpc-url ${rpcUrl} --gas-limit 500000 --json`;

        console.log(`[RelayService] 🚀 Executing CAST command...`);
        console.log(`[RelayService] Command: ${command.replace(relayerKey, '******')}`);

        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
            try {
                const output = execSync(command).toString();
                console.log(`[RelayService] 📜 Cast Output: ${output}`);

                const json = JSON.parse(output);
                const txHash = json.transactionHash;

                this.publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1 })
                    .then(r => {
                        if (r.status === 'success') console.log(`[RelayService] ${txHash} confirmed!`);
                        else console.warn(`[RelayService] ${txHash} reverted on-chain.`);
                    })
                    .catch(err => console.error(`[RelayService] Wait error: ${err}`));

                return txHash;
            } catch (e: any) {
                attempts++;
                const errorMsg = e.stderr?.toString() || e.message;
                console.warn(`[RelayService] Cast effort ${attempts} failed:`, errorMsg);

                if (attempts < maxAttempts && (errorMsg.includes("null response") || errorMsg.includes("timed out"))) {
                    console.log(`[RelayService] ⏳ Retrying in 2 seconds...`);
                    await new Promise(r => setTimeout(r, 2000));
                    continue;
                }
                throw new Error(`Cast failed after ${attempts} attempts: ${errorMsg}`);
            }
        }
    }
}


export const relayService = new RelayService();
