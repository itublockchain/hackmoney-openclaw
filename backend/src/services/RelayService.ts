// import { Coinbase, Wallet, WalletData } from "@coinbase/cdp-sdk"; // Dynamic import used instead
import config from '../config';
import { createPublicClient, http, type Address, type Hex } from "viem";

export class RelayService {

    private publicClient;
    private cdpWallet: any | null = null; // Type as any since we dynamic import

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
     * Initializes the Coinbase CDP SDK and Wallet.
     */
    private async initCDP() {
        if (this.cdpWallet) return this.cdpWallet;

        if (!config.CDP_API_KEY_NAME || !config.CDP_API_KEY_PRIVATE_KEY) {
            throw new Error("CDP API credentials are missing. Set CDP_API_KEY_NAME and CDP_API_KEY_PRIVATE_KEY.");
        }

        try {
            // Dynamic import to prevent crash if package is missing
            const { Coinbase, Wallet } = await import("@coinbase/cdp-sdk");

            Coinbase.configure({
                apiKeyName: config.CDP_API_KEY_NAME,
                privateKey: config.CDP_API_KEY_PRIVATE_KEY
            });

            // Create a new wallet or load if persisting (for now, we create fresh or load from seed if needed)
            console.log("[RelayService] Initializing CDP Wallet...");

            // Note: In a real prod environment, we should load from a WALLET_ID or SEED.
            // For now, we'll try to create one. 
            const wallet = await Wallet.create({ networkId: 'base-mainnet' });
            console.log(`[RelayService] CDP Wallet Initialized: ${await wallet.getDefaultAddress()}`);
            this.cdpWallet = wallet;
            return wallet;
        } catch (error: any) {
            console.error("[RelayService] Failed to initialize CDP SDK:", error);
            throw error;
        }
    }

    /**
     * Relays an EIP-7702 transaction using Coinbase CDP SDK.
     */
    async relayWithCast(params: {
        to: Address,
        rawAuthHex: string,
        data?: Hex
    }) {
        try {
            console.log(`[RelayService] Attempting to use CDP SDK for EIP-7702...`);

            // Try to initialize CDP
            const wallet = await this.initCDP();
            const address = await wallet.getDefaultAddress();
            console.log(`[RelayService] CDP Wallet Active: ${address}`);

            // Placeholder for future SDK 7702 implementation
            // Currently throwing to trigger fallback as SDK doesn't support 7702 fully yet
            throw new Error("CDP SDK 7702 support not fully implemented in this agent version. Falling back to cast.");

        } catch (e: any) {
            console.warn(`[RelayService] CDP SDK unavailable/failed (${e.message}), falling back to CAST...`);
            return this.relayWithCastLegacy(params);
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

        let target = params.to;
        let dataArg = params.data || '0x';

        // IMPROVED PATTERN: If data is empty/0x, use Zero Address as target (Carrier Transaction)
        // This follows `cast send $(cast az) --auth ...`
        if (!dataArg || dataArg === '0x' || dataArg === '') {
            target = '0x0000000000000000000000000000000000000000';
            dataArg = ''; // Cast handles empty string as no data
        }

        const command = `cast send ${target} ${dataArg} --private-key ${relayerKey} --auth ${params.rawAuthHex} --rpc-url ${rpcUrl} --gas-limit 500000 --json`;

        console.log(`[RelayService] 🚀 Executing CAST command...`);
        console.log(`[RelayService] Command: ${command.replace(relayerKey, '******')}`);

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
            console.warn('[RelayService] Cast failed:', e.message);
            throw e;
        }
    }
}

export const relayService = new RelayService();
