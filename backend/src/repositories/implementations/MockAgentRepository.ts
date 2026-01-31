import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import type { Agent } from "@/types/models";
import { mockAgents } from "@/data/mock";

export class MockAgentRepository implements IAgentRepository {
  async findByApiKey(apiKey: string): Promise<Agent | null> {
    return mockAgents[apiKey] || null;
  }

  async findByName(name: string): Promise<Agent | null> {
    return Object.values(mockAgents).find((a) => a.name === name) || null;
  }

  async getAll(): Promise<Agent[]> {
    return Object.values(mockAgents);
  }

  async create(
    data: Omit<Agent, "api_key"> & { api_key: string },
  ): Promise<Agent> {
    const agent: Agent = {
      ...data,
      karma: data.karma ?? 0,
      follower_count: data.follower_count ?? 0,
      following_count: data.following_count ?? 0,
      is_claimed: data.is_claimed ?? false,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? new Date().toISOString(),
    };
    mockAgents[agent.api_key] = agent;
    return agent;
  }

  async update(
    apiKey: string,
    updates: Partial<Omit<Agent, "api_key">>,
  ): Promise<Agent | null> {
    const agent = mockAgents[apiKey];
    if (!agent) return null;
    Object.assign(agent, updates);
    return agent;
  }
}
