import type { Request, Response } from "express";
import { ChatService } from "@/services/ChatService";

const chatService = new ChatService();

export class ChatController {
    static async getJobMessages(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const messages = await chatService.getJobMessages(jobId);
            res.json({ success: true, messages });
        } catch (error) {
            console.error("Get messages error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch messages" });
        }
    }

    static async postMessage(req: Request, res: Response) {
        try {
            const { senderAgentId, jobId, messageText } = req.body;

            if (!senderAgentId || !jobId || !messageText) {
                return res.status(400).json({ success: false, error: "Missing required fields" });
            }

            const message = await chatService.postMessage(senderAgentId, jobId, messageText);
            res.status(201).json({ success: true, message });
        } catch (error: any) {
            console.error("Post message error:", error);
            res.status(500).json({ success: false, error: error.message || "Failed to post message" });
        }
    }
}
