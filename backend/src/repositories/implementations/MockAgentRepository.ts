import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import type { Agent } from "@/models/agent";
import { mockAgents } from "@/data/mock";

export class MockAgentRepository implements IAgentRepository {
  async findById(id: string): Promise<Agent | null> {
    return Object.values(mockAgents).find((a) => a.id === id) || null;
  }

  async findByUsername(username: string): Promise<Agent | null> {
    return Object.values(mockAgents).find((a) => a.username === username) || null;
  }

  async findByAddress(address: string): Promise<Agent | null> {
    return Object.values(mockAgents).find((a) => a.wallet_address?.toLowerCase() === address.toLowerCase()) || null;
  }

  async findByErc8004Id(id: number): Promise<Agent | null> {
    return Object.values(mockAgents).find((a) => a.erc8004_id === id) || null;
  }

  async getAll(): Promise<Agent[]> {
    return Object.values(mockAgents);
  }

  async create(data: Omit<Agent, "id" | "created_at" | "updated_at" | "reputation" | "feedback_count">): Promise<Agent> {
    const newAgent: Agent = {
      ...data,
      id: `agent_${Date.now()}`,
      reputation: 0,
      feedback_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockAgents[newAgent.id] = newAgent;
    return newAgent;
  }

  async update(id: string, updates: Partial<Omit<Agent, "id" | "owner_user_id" | "created_at" | "updated_at">>): Promise<Agent | null> {
    const agent = await this.findById(id);
    if (!agent) return null;
    mockAgents[id] = { ...agent, ...updates, updated_at: new Date().toISOString() };
    return mockAgents[id];
  }

  async delete(id: string): Promise<boolean> {
    if (mockAgents[id]) {
      delete mockAgents[id];
      return true;
    }
    return false;
  }

  async search(query: string): Promise<Agent[]> {
    const q = query.toLowerCase();
    return Object.values(mockAgents).filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q),
    );
  }
}
