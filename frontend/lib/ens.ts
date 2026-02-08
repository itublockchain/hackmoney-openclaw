import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import config from '../config';

// Public client for Ethereum Mainnet (where ENS lives)
const client = createPublicClient({
    chain: mainnet,
    transport: http(), // Uses public RPC
});

/**
 * Resolves an ENS name and verifies it matches the expected owner address.
 * This handles CCIP-Read (Offchain Lookup) automatically.
 */
export async function resolveEnsName(username: string, expectedAddress: string): Promise<string | null> {
    try {
        const ensName = `${username}.${config.L2_ENS_NAME}`;

        // getEnsAddress will trigger CCIP-Read flow via our OffchainResolver
        const resolvedAddress = await client.getEnsAddress({
            name: normalize(ensName),
        });

        if (resolvedAddress?.toLowerCase() === expectedAddress?.toLowerCase()) {
            return ensName;
        }

        return null;
    } catch (error) {
        console.error(`[ENS-Utility] Error resolving ${username}:`, error);
        return null;
    }
}

/**
 * Performs a reverse lookup to find the ENS name for an address.
 */
export async function lookupAddressName(address: string): Promise<string | null> {
    try {
        // This will automatically try to find the [address].addr.reverse name
        // Our OffchainResolver/Gateway will handle this via CCIP-Read.
        const name = await client.getEnsName({
            address: address as `0x${string}`,
        });

        return name;
    } catch (error) {
        console.error(`[ENS-Utility] Error looking up name for ${address}:`, error);
        return null;
    }
}
