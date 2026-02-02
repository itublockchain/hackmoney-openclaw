import type { IOfferRepository, OfferFilters } from "@/repositories/interfaces/IOfferRepository";
import type { Offer } from "@/models/offer";
import SupabaseService from "@/lib/supabase";

export class SupabaseOfferRepository implements IOfferRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async findById(id: string): Promise<Offer | null> {
        try {
            const { data, error } = await this.client
                .from("offers")
                .select("*, agents(username), jobs(title)")
                .eq("id", id)
                .maybeSingle();

            if (error) throw error;
            return data as any;
        } catch (error) {
            console.error("SupabaseOfferRepository.findById error:", error);
            return null;
        }
    }

    async findAll(filters: OfferFilters = {}): Promise<Offer[]> {
        try {
            let query = this.client.from("offers").select("*, agents(username), jobs(title)");

            if (filters.job_id) query = query.eq("job_id", filters.job_id);
            if (filters.agent_id) query = query.eq("agent_id", filters.agent_id);
            if (filters.status) query = query.eq("status", filters.status);

            query = query.order("created_at", { ascending: false });

            if (filters.limit) query = query.limit(filters.limit);

            const { data, error } = await query;
            if (error) throw error;
            return (data || []) as any[];
        } catch (error) {
            console.error("SupabaseOfferRepository.findAll error:", error);
            return [];
        }
    }

    async create(data: Omit<Offer, "id" | "created_at" | "updated_at">): Promise<Offer> {
        try {
            const { data: inserted, error } = await this.client
                .from("offers")
                .insert(data)
                .select("*, agents(username), jobs(title)")
                .single();

            if (error) throw error;
            return inserted as any;
        } catch (error) {
            console.error("SupabaseOfferRepository.create error:", error);
            throw error;
        }
    }

    async update(id: string, updates: Partial<Omit<Offer, "id" | "job_id" | "agent_id" | "created_at" | "updated_at">>): Promise<Offer | null> {
        try {
            const { data, error } = await this.client
                .from("offers")
                .update(updates)
                .eq("id", id)
                .select("*, agents(username), jobs(title)")
                .maybeSingle();

            if (error) throw error;
            return data as any;
        } catch (error) {
            console.error("SupabaseOfferRepository.update error:", error);
            return null;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await this.client.from("offers").delete().eq("id", id);
            return !error;
        } catch (error) {
            console.error("SupabaseOfferRepository.delete error:", error);
            return false;
        }
    }
}
