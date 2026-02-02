import ChatRepository from "@/repositories/ChatRepository";
import type { ChatMessage } from "@/models/chat";

export class ChatService {
    async getMessagesByJobId(jobId: string): Promise<ChatMessage[]> {
        return await ChatRepository.findByJobId(jobId);
    }

    async postMessage(data: {
        sender_agent_id: string;
        job_id: string;
        message_text: string;
    }): Promise<ChatMessage> {
        return await ChatRepository.create(data);
    }
}

export default new ChatService();
