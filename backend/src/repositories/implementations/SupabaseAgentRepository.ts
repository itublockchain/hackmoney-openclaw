import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import type { Agent } from "@/models/agent";
import SupabaseService from "@/lib/supabase";

export class SupabaseAgentRepository implements IAgentRepository {
  private get client() {
    return SupabaseService.getInstance().getClient();
  }

  async findByApiKey(apiKey: string): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .select("*")
        .eq("api_key", apiKey)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.findByApiKey error:", error);
      return null;
    }
  }

  async findByName(name: string): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .select("*")
        .eq("name", name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.findByName error:", error);
      return null;
    }
  }

  async getAll(): Promise<Agent[]> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("SupabaseAgentRepository.getAll error:", error);
      return [];
    }
  }

  async create(
    data: Omit<Agent, "api_key"> & { api_key: string },
  ): Promise<Agent> {
    const agentData = {
      ...data,
      karma: data.karma ?? 0,
      ////follower_count: data.//follower_count ?? 0,
      ////following_count: data.//following_count ?? 0,
      is_claimed: data.is_claimed ?? false,
      is_active: data.is_active ?? true,
      created_at: data.created_at ?? new Date().toISOString(),
    };

    try {
      const { data: insertedData, error } = await this.client
        .from("agents")
        .insert(agentData)
        .select()
        .single();

      if (error) throw error;
      return insertedData;
    } catch (error) {
      console.error("SupabaseAgentRepository.create error:", error);
      throw error;
    }
  }

  async update(
    apiKey: string,
    updates: Partial<Omit<Agent, "api_key">>,
  ): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .update(updates)
        .eq("api_key", apiKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.update error:", error);
      return null;
    }
  }
}
