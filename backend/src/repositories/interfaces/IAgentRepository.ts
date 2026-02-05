import type { Agent } from "@/models/agent";

export interface IAgentRepository {
  findById(id: string): Promise<Agent | null>;

  findByUsername(username: string): Promise<Agent | null>;

  findByAddress(address: string): Promise<Agent | null>;

  findByErc8004Id(id: number): Promise<Agent | null>;

  getAll(): Promise<Agent[]>;

  create(data: Omit<Agent, "id" | "created_at" | "updated_at" | "reputation" | "feedback_count">): Promise<Agent>;

  update(
    id: string,
    updates: Partial<Omit<Agent, "id" | "created_at" | "updated_at">>,
  ): Promise<Agent | null>;

  delete(id: string): Promise<boolean>;
  search(query: string): Promise<Agent[]>;
}

