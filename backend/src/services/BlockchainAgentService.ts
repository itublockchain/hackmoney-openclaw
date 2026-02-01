import { SDK } from "agent0-sdk";
import config from "@/config";
import type { Agent } from "@/models/agent";
import { SupabaseAgentStorage } from "@/lib/SupabaseAgentStorage";
import { MockAgentStorage } from "@/lib/MockAgentStorage";

export class BlockchainAgentService {
    private sdk!: SDK;
    private storage!: SupabaseAgentStorage | MockAgentStorage;
    private initialized: boolean = false;

    constructor() {
        if (config.CHAIN_ID && config.RPC_URL && config.PRIVATE_KEY) {
            try {
                this.sdk = new SDK({
                    chainId: config.CHAIN_ID,
                    rpcUrl: config.RPC_URL,
                    privateKey: config.PRIVATE_KEY,
                });

                if (config.SUPABASE_URL && config.SUPABASE_SERVICE_KEY) {
                    this.storage = new SupabaseAgentStorage();
                } else {
                    console.log("Using MockAgentStorage (Supabase config missing)");
                    this.storage = new MockAgentStorage();
                }

                this.initialized = true;
            } catch (err) {
                console.error("Failed to initialize Blockchain SDK:", err);
                this.initialized = false;
            }
        } else {
            console.warn("Blockchain config missing, BlockchainService will not work");
        }
    }

    private checkInit() {
        if (!this.initialized) throw new Error("BlockchainService not initialized (missing config)");
    }

    // Returns the URL that the agent will host its metadata at
    private getMetadataUrl(agentId: string): string {
        return `${config.APP_URL}/api/${config.API_VERSION}/agents/${agentId}/metadata`;
    }

    async registerAgentOnChain(agent: Agent) {
        this.checkInit();
        console.log(`--- Starting On-Chain Registration for ${agent.name} ---`);

        // 1. Create local sdk agent wrapper
        const sdkAgent = this.sdk.createAgent(
            agent.name,
            agent.description,
            "https://robohash.org/" + agent.name
        );

        // 2. Register on-chain
        const placeholderUrl = "https://placeholder.registration/init.json";
        const tx1 = await sdkAgent.registerHTTP(placeholderUrl);
        console.log(`Tx submitted: ${tx1.hash}`);
        await tx1.waitMined();

        const agentId = sdkAgent.agentId;
        if (!agentId) throw new Error("Failed to retrieve Agent ID");

        // 3. Construct Metadata URL (Dynamic)
        // We use the agent.id (UUID) as the lookup key for the endpoint
        if (!agent.id) throw new Error("Agent missing database ID");
        const metadataUrl = this.getMetadataUrl(agent.id);

        // 4. Update URI
        const tx2 = await sdkAgent.setAgentURI(metadataUrl);
        await tx2.waitMined();

        return { txHash: tx2.hash, agentId, metadataUrl };
    }

    async updateMetadataOnChain(agent: Agent, blockchainAgentId: string) {
        this.checkInit();
        if (!agent.id) throw new Error("Agent missing database ID");

        const sdkAgent = await this.sdk.loadAgent(blockchainAgentId);
        const metadataUrl = this.getMetadataUrl(agent.id);

        const tx = await sdkAgent.setAgentURI(metadataUrl);
        await tx.waitMined();
        return { txHash: tx.hash, metadataUrl };
    }


    private parseNumericId(fullAgentId: string): string {
        const m = fullAgentId.match(/^\d+:(\d+)$/);
        if (m?.[1]) return m[1];
        const parts = fullAgentId.split(':');
        return parts.length > 1 ? parts[parts.length - 1]! : fullAgentId;
    }
}

export default new BlockchainAgentService();
