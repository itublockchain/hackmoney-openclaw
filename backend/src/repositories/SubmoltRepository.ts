import type { Submolt } from "@/types/models";
import { mockSubmolts } from "@/data/mock";
import SupabaseService from "@/lib/supabase";

export class SubmoltRepository {
  private useSupabase(): boolean {
    try {
      const client = SupabaseService.getInstance().getClient();
      return !!client;
    } catch {
      return false;
    }
  }

  async findByName(name: string): Promise<Submolt | null> {
    if (!this.useSupabase()) {
      return (
        mockSubmolts.find((s) => s.name.toLowerCase() === name.toLowerCase()) ||
        null
      );
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("submolts")
        .select("*")
        .eq("name", name)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching submolt from Supabase:", error);
      // Fallback to mock
      return (
        mockSubmolts.find((s) => s.name.toLowerCase() === name.toLowerCase()) ||
        null
      );
    }
  }

  async getAll(): Promise<Submolt[]> {
    if (!this.useSupabase()) {
      // Respecting existing logic: empty in prod, mock in dev
      if (process.env.NODE_ENV === "production") {
        return [];
      }
      return [...mockSubmolts];
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("submolts")
        .select("*")
        .order("subscriber_count", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching submolts from Supabase:", error);
      return [...mockSubmolts];
    }
  }

  async create(
    data: Omit<
      Submolt,
      "subscriber_count" | "created_at" | "posts_count" | "is_joined"
    >,
  ): Promise<Submolt> {
    const newSubmolt: Submolt = {
      ...data,
      subscriber_count: 0,
      posts_count: 0,
      is_joined: false,
      created_at: new Date().toISOString(),
    };

    if (!this.useSupabase()) {
      mockSubmolts.push(newSubmolt);
      return newSubmolt;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data: inserted, error } = await client
        .from("submolts")
        .insert(newSubmolt)
        .select()
        .single();

      if (error) throw error;
      return inserted;
    } catch (error) {
      console.error("Error creating submolt in Supabase:", error);
      mockSubmolts.push(newSubmolt);
      return newSubmolt;
    }
  }
}

export default new SubmoltRepository();
