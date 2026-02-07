import AgentRepository from "@/repositories/AgentRepository";
import type { Agent } from "@/models/agent";
import config from "@/config";
import { encodeFunctionData, createPublicClient, http, keccak256, stringToBytes } from "viem";
import { relayService } from "./RelayService";

export class AgentService {
  async getAllAgents(): Promise<Agent[]> {
    return await AgentRepository.getAll();
  }

  async getAgentById(id: string): Promise<Agent | null> {
    return await AgentRepository.findById(id);
  }

  async getAgentByUsername(username: string): Promise<Agent | null> {
    return await AgentRepository.findByUsername(username);
  }

  async getAgentByAddress(address: string): Promise<Agent | null> {
    return await AgentRepository.findByAddress(address);
  }

  async registerAgent(data: {
    username: string;
    title?: string;
    description?: string;
    wallet_address: string; // Made mandatory as per controller logic
    erc8004_id?: number;
    metadata?: Record<string, any>;
  }): Promise<Agent> {
    // Check if agent with wallet address already exists
    const existingAgent = await this.getAgentByAddress(data.wallet_address);
    if (existingAgent) {
      throw new Error("Agent with this wallet address already exists");
    }

    // Check if agent with username already exists
    const existingUsername = await this.getAgentByUsername(data.username);
    if (existingUsername) {
      throw new Error("Agent with this username already exists");
    }

    return await AgentRepository.create({
      username: data.username,
      title: data.title,
      description: data.description,
      wallet_address: data.wallet_address,
      erc8004_id: data.erc8004_id,
      metadata: data.metadata || {},
    });
  }

  async updateAgent(
    id: string,
    updates: Partial<
      Omit<Agent, "id" | "owner_user_id" | "created_at" | "updated_at">
    >
  ): Promise<Agent | null> {
    return await AgentRepository.update(id, updates);
  }

  async deleteAgent(id: string): Promise<boolean> {
    return await AgentRepository.delete(id);
  }

  generateAgentMetadata(agent: Agent) {
    const name = agent.title || agent.username;
    const description =
      agent.description || "An autonomous AI agent on the Moltlancer platform.";

    return {
      name: name,
      description: description,
      type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
      image: `https://robohash.org/${agent.id}?set=set4`,
      active: true,
      updatedAt: Math.floor(Date.now() / 1000),
      wallet_address: agent.wallet_address,
      agent_URI: `${config.METADATA_BASE_URL}/api/${config.API_VERSION}/agents/${agent.id}/metadata`,
      x402_enabled: true,

      endpoints: [
        {
          name: "Moltlancer Payment API",
          version: "1.0.0",
          endpoint: `${config.APP_URL}/api/v1/agents/${agent.id}/x402`,
        },
      ],

      capabilities: [
        "social-interaction",
        "job-listing",
        "autonomous-messaging",
      ],

      registrations: agent.metadata?.blockchainId
        ? [
          {
            agentId: agent.metadata.blockchainId,
            agentRegistry: "eip155:" + config.CHAIN_ID + ":registry",
          },
        ]
        : [],

      supportedTrust: ["reputation"],
    };
  }

  async registerSubdomain(agent: Agent) {
    if (!config.L2_SUBDOMAIN_REGISTRY_ADDRESS) {
      console.warn("L2_SUBDOMAIN_REGISTRY_ADDRESS not set. Skipping subdomain registration.");
      return null;
    }

    try {
      console.log(`[AgentService] Registering subdomain '${agent.username}' for ${agent.wallet_address}...`);

      const data = encodeFunctionData({
        abi: [{
          name: "register",
          type: "function",
          inputs: [{ type: "string", name: "label" }, { type: "address", name: "owner" }],
          outputs: []
        }],
        functionName: "register",
        args: [agent.username, agent.wallet_address as `0x${string}`]
      });

      const txHash = await relayService.sendTransaction({
        to: config.L2_SUBDOMAIN_REGISTRY_ADDRESS as `0x${string}`,
        data: data
      });

      console.log(`[AgentService] Subdomain registered. Tx: ${txHash}`);
      return txHash;

    } catch (error: any) {
      console.error(`[AgentService] Subdomain registration failed for '${agent.username}':`, error.message);
      return null;
    }
  }

  async checkSubdomainAvailability(username: string): Promise<boolean> {
    if (!config.L2_SUBDOMAIN_REGISTRY_ADDRESS) return true; // Skip if not configured

    try {
      const client = createPublicClient({
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

      const available = await client.readContract({
        address: config.L2_SUBDOMAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: [{
          name: "available",
          type: "function",
          inputs: [{ type: "string", name: "label" }],
          outputs: [{ type: "bool", name: "" }]
        }],
        functionName: "available",
        args: [username]
      });

      return available as boolean;
    } catch (error) {
      console.error(`[AgentService] Failed to check subdomain availability for '${username}':`, error);
      return false; // Stricter: assume NOT available if check fails
    }
  }

  async verifySubdomainOwnershipOnChain(username: string, address: string): Promise<boolean> {
    if (!config.L2_SUBDOMAIN_REGISTRY_ADDRESS) return false;

    try {
      const client = createPublicClient({
        chain: {
          id: config.CHAIN_ID,
          name: "Base",
          rpcUrls: {
            default: { http: [config.RPC_URL] },
          },
        } as any,
        transport: http(config.RPC_URL)
      });

      // registry stores keccak256(label) => address
      const owner = await client.readContract({
        address: config.L2_SUBDOMAIN_REGISTRY_ADDRESS as `0x${string}`,
        abi: [{
          name: "domains",
          type: "function",
          inputs: [{ type: "bytes32", name: "" }],
          outputs: [{ type: "address", name: "" }]
        }],
        functionName: "domains",
        args: [keccak256(stringToBytes(username))]
      });

      return (owner as string).toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("[AgentService] Failed to verify subdomain ownership on-chain:", error);
      return false;
    }
  }
}

export default new AgentService();
