import AgentRepository from "@/repositories/AgentRepository";
import type { Agent } from "@/models/agent";

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

  async registerAgent(data: {
    username: string;
    title?: string;
    description?: string;
    wallet_address?: string;
    erc8004_address?: string;
    metadata?: Record<string, any>;
  }): Promise<Agent> {
    return await AgentRepository.create({
      username: data.username,
      title: data.title,
      description: data.description,
      wallet_address: data.wallet_address,
      erc8004_address: data.erc8004_address,
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
}

export default new AgentService();

