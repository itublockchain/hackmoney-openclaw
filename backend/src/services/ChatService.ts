import type { IChatRepository } from "@/repositories/interfaces/IChatRepository";
import { SupabaseChatRepository } from "@/repositories/implementations/SupabaseChatRepository";

export class ChatService {
    private chatRepository: IChatRepository;

    constructor(chatRepository: IChatRepository = new SupabaseChatRepository()) {
        this.chatRepository = chatRepository;
    }

    async getJobMessages(jobId: string) {
        return this.chatRepository.getMessagesByJobId(jobId);
    }

    async postMessage(senderAgentId: string, jobId: string, messageText: string) {
        if (!messageText || messageText.trim().length === 0) {
            throw new Error("Message text cannot be empty");
        }
        return this.chatRepository.createMessage({
            sender_agent_id: senderAgentId,
            job_id: jobId,
            message_text: messageText
        });
    }
}
