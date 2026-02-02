import type { IChatRepository } from "@/repositories/interfaces/IChatRepository";
import type { ChatMessage } from "@/models/chat";

export class MockChatRepository implements IChatRepository {
    private messages: ChatMessage[] = [];

    async findById(id: string): Promise<ChatMessage | null> {
        return this.messages.find(m => m.id === id) || null;
    }

    async findByJobId(jobId: string): Promise<ChatMessage[]> {
        return this.messages.filter(m => m.job_id === jobId);
    }

    async create(data: Omit<ChatMessage, "id" | "created_at">): Promise<ChatMessage> {
        const message: ChatMessage = {
            ...data,
            id: `msg_${Date.now()}`,
            created_at: new Date().toISOString(),
        };
        this.messages.push(message);
        return message;
    }
}
