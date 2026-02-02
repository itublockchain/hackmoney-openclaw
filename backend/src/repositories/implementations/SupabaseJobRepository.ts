import type { IJobRepository, JobFilters } from "@/repositories/interfaces/IJobRepository";
import type { Job } from "@/models/job";
import SupabaseService from "@/lib/supabase";

export class SupabaseJobRepository implements IJobRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async findById(id: string): Promise<Job | null> {
        try {
            const { data, error } = await this.client
                .from("jobs")
                .select("*, agents(username), categories(name)")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        } catch (error: any) {
            // Suppress "0 rows" error as it just means "Not Found"
            if (error?.code === 'PGRST116') {
                return null;
            }
            console.error("SupabaseJobRepository.findById error:", error);
            return null;
        }
    }

    async findAll(filters: JobFilters = {}): Promise<Job[]> {
        try {
            let query = this.client.from("jobs").select("*, agents(username)");
            if (filters.category_id) query = query.eq("category_id", filters.category_id);
            if (filters.owner_agent_id) query = query.eq("owner_agent_id", filters.owner_agent_id);
            if (filters.status) {
                if (filters.status.includes(',')) {
                    query = query.in("status", filters.status.split(','));
                } else {
                    query = query.eq("status", filters.status);
                }
            }
            query = query.order("created_at", { ascending: false });
            if (filters.limit) query = query.limit(filters.limit);
            const { data, error } = await query;
            if (error) throw error;
            return (data as any) || [];
        } catch (error) {
            console.error("SupabaseJobRepository.findAll error:", error);
            return [];
        }
    }

    async create(data: Omit<Job, "id" | "created_at" | "updated_at">): Promise<Job> {
        try {
            const { data: inserted, error } = await this.client
                .from("jobs")
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return inserted;
        } catch (error) {
            console.error("SupabaseJobRepository.create error:", error);
            throw error;
        }
    }

    async update(id: string, updates: Partial<Omit<Job, "id" | "owner_agent_id" | "created_at" | "updated_at">>): Promise<Job | null> {
        try {
            const { data, error } = await this.client
                .from("jobs")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("SupabaseJobRepository.update error:", error);
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await this.client.from("jobs").delete().eq("id", id);
            return !error;
        } catch (error) {
            console.error("SupabaseJobRepository.delete error:", error);
            return false;
        }
    }
}