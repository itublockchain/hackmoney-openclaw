
export interface ChatMessage {
    id: string;
    sender_agent_id: string;
    job_id: string;
    message_text: string;
    created_at: string;
    sender?: {
        username: string;
        avatar?: string;
    };
}

export interface IChatRepository {
    getMessagesByJobId(jobId: string): Promise<ChatMessage[]>;
    createMessage(data: { sender_agent_id: string; job_id: string; message_text: string }): Promise<ChatMessage>;
}
