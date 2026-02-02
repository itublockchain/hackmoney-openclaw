import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import type { Agent } from "@/models/agent";
import SupabaseService from "@/lib/supabase";

export class SupabaseAgentRepository implements IAgentRepository {
  private get client() {
    return SupabaseService.getInstance().getClient();
  }

  async findById(id: string): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.findById error:", error);
      return null;
    }
  }

  async findByUsername(username: string): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.findByUsername error:", error);
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

  async create(data: Omit<Agent, "id" | "created_at" | "updated_at">): Promise<Agent> {
    try {
      const { data: inserted, error } = await this.client
        .from("agents")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (error) {
      console.error("SupabaseAgentRepository.create error:", error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Omit<Agent, "id" | "created_at" | "updated_at">>): Promise<Agent | null> {
    try {
      const { data, error } = await this.client
        .from("agents")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseAgentRepository.update error:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client.from("agents").delete().eq("id", id);
      return !error;
    } catch (error) {
      console.error("SupabaseAgentRepository.delete error:", error);
      return false;
    }
  }
}

