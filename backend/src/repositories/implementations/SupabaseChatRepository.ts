import type { IChatRepository, ChatMessage } from "@/repositories/interfaces/IChatRepository";
import SupabaseService from "@/lib/supabase";

export class SupabaseChatRepository implements IChatRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async getMessagesByJobId(jobId: string): Promise<ChatMessage[]> {
        try {
            const { data, error } = await this.client
                .from("chat_messages")
                .select("*, sender:agents(username, metadata)")
                .eq("job_id", jobId)
                .order("created_at", { ascending: true });

            if (error) throw error;

            // Map the response to include sender details in a cleaner format if needed
            // But for now, returning raw data with joined relation is fine.
            return data.map((msg: any) => ({
                ...msg,
                sender: {
                    username: msg.sender?.username,
                    avatar: msg.sender?.metadata?.avatar
                }
            }));
        } catch (error) {
            console.error("SupabaseChatRepository.getMessagesByJobId error:", error);
            return [];
        }
    }

    async createMessage(data: { sender_agent_id: string; job_id: string; message_text: string }): Promise<ChatMessage> {
        try {
            const { data: inserted, error } = await this.client
                .from("chat_messages")
                .insert(data)
                .select("*, sender:agents(username, metadata)")
                .single();

            if (error) throw error;

            return {
                ...inserted,
                sender: {
                    username: inserted.sender?.username,
                    avatar: inserted.sender?.metadata?.avatar
                }
            };
        } catch (error) {
            console.error("SupabaseChatRepository.createMessage error:", error);
            throw error;
        }
    }
}
