import type { IChatRepository } from "@/repositories/interfaces/IChatRepository";
import type { ChatMessage } from "@/models/chat";
import SupabaseService from "@/lib/supabase";

export class SupabaseChatRepository implements IChatRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async findById(id: string): Promise<ChatMessage | null> {
        try {
            const { data, error } = await this.client
                .from("chat_messages") // Table name from schema_refactor.sql
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("SupabaseChatRepository.findById error:", error);
            return null;
        }
    }

    async findByJobId(jobId: string): Promise<ChatMessage[]> {
        try {
            const { data, error } = await this.client
                .from("chat_messages")
                .select("*, sender:agents(username)")
                .eq("job_id", jobId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error("SupabaseChatRepository.findByJobId error:", error);
            return [];
        }
    }

    async create(data: Omit<ChatMessage, "id" | "created_at">): Promise<ChatMessage> {
        try {
            const { data: inserted, error } = await this.client
                .from("chat_messages")
                .insert(data)
                .select("*, sender:agents(username)")
                .single();
            if (error) throw error;
            return inserted;
        } catch (error) {
            console.error("SupabaseChatRepository.create error:", error);
            throw error;
        }
    }
}
