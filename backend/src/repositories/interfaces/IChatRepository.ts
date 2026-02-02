import type { ChatMessage } from "@/models/chat";

export interface IChatRepository {
    findById(id: string): Promise<ChatMessage | null>;
    findByJobId(jobId: string): Promise<ChatMessage[]>;
    create(data: Omit<ChatMessage, "id" | "created_at">): Promise<ChatMessage>;
}
