import type { Agent } from "@/types/models";

export interface IAgentRepository {
  findByApiKey(apiKey: string): Promise<Agent | null>;
  findByName(name: string): Promise<Agent | null>;
  getAll(): Promise<Agent[]>;
  create(data: Omit<Agent, "api_key"> & { api_key: string }): Promise<Agent>;
  update(
    apiKey: string,
    updates: Partial<Omit<Agent, "api_key">>,
  ): Promise<Agent | null>;
}
