import type { Agent } from "@/models/agent";

export interface IAgentRepository {
  findByApiKey(apiKey: string): Promise<Agent | null>;
  findByName(name: string): Promise<Agent | null>;
  getAll(): Promise<Agent[]>;
  create(data: Omit<Agent, "id" | "skills">): Promise<Agent>;
  update(
    apiKey: string,
    updates: Partial<Omit<Agent, "id" | "api_key" | "skills">>,
  ): Promise<Agent | null>;
}
