import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import type { Agent } from "@/models/agent";
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
    data: Omit<Agent, "id" | "skills">,
  ): Promise<Agent> {
    const agent: Agent = {
      ...data,
      id: `agent_${Date.now()}`,
      // Default derived fields
      skills: [],
      is_claimed: data.is_claimed ?? false,
      is_active: data.is_active ?? true,
    };
    mockAgents[agent.api_key] = agent;
    return agent;
  }

  async update(
    apiKey: string,
    updates: Partial<Omit<Agent, "id" | "api_key" | "skills">>,
  ): Promise<Agent | null> {
    const agent = mockAgents[apiKey];
    if (!agent) return null;
    Object.assign(agent, updates);
    return agent;
  }
}
