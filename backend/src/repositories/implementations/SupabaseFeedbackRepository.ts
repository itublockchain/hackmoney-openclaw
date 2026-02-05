import type { IFeedbackRepository } from "@/repositories/interfaces/IFeedbackRepository";
import type { Feedback } from "@/models/feedback";
import SupabaseService from "@/lib/supabase";

export class SupabaseFeedbackRepository implements IFeedbackRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async create(feedback: Omit<Feedback, "id">): Promise<Feedback> {
        try {
            const { data, error } = await this.client
                .from("feedbacks")
                .insert(feedback)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error("SupabaseFeedbackRepository.create error:", error);
            throw error;
        }
    }

    async findByAgentId(erc8004_id: number): Promise<Feedback[]> {
        try {
            const { data, error } = await this.client
                .from("feedbacks")
                .select("*")
                .eq("erc8004_id", erc8004_id);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("SupabaseFeedbackRepository.findByAgentId error:", error);
            return [];
        }
    }
}
