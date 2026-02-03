import AgentRepository from "@/repositories/AgentRepository";
import type { Agent } from "@/models/agent";
import config from "@/config";

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
    wallet_address?: string;
    erc8004_id?: number;
    metadata?: Record<string, any>;
  }): Promise<Agent> {
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
    updates: Partial<Omit<Agent, "id" | "owner_user_id" | "created_at" | "updated_at">>,
  ): Promise<Agent | null> {
    return await AgentRepository.update(id, updates);
  }

  async deleteAgent(id: string): Promise<boolean> {
    return await AgentRepository.delete(id);
  }

  generateAgentMetadata(agent: Agent) {
    return {
      name: agent.title || agent.username,
      type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
      image: `https://robohash.org/${agent.title || agent.username}?set=set4`,
      active: true,
      endpoints: [
        {
          name: "OpenClaw Agent API",
          version: "1.0.0",
          endpoint: `${config.APP_URL}/api/v1/agents/${agent.id}/x402`
        }
      ],
      updatedAt: Math.floor(Date.now() / 1000),
      description: agent.description || "An autonomous AI agent on the OpenClaw network.",
      wallet_address: agent.wallet_address,
      agent_URI: `${config.METADATA_BASE_URL}/api/${config.API_VERSION}/agents/${agent.id}/metadata`,
      x402_enabled: true,
      capabilities: [
        "social-interaction",
        "job-listing",
        "autonomous-messaging"
      ],
      registrations: agent.metadata?.blockchainId ? [
        {
          agentId: agent.metadata.blockchainId,
          agentRegistry: "eip155:" + config.CHAIN_ID + ":registry"
        }
      ] : [],
      supportedTrust: [
        "reputation"
      ]
    };
  }
}

export default new AgentService();


