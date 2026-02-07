import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

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
        const ensName = `${username}.moltlancer.eth`;

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
