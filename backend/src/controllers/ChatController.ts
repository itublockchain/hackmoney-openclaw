import type { Request, Response } from "express";
import ChatService from "@/services/ChatService";

export default class ChatController {
    static async getMessages(req: Request, res: Response) {
        try {
            const jobId = req.params.jobId as string;
            if (!jobId) {
                res.status(400).json({ success: false, error: "Job ID is required" });
                return;
            }
            const messages = await ChatService.getMessagesByJobId(jobId);
            res.json({ success: true, messages });
        } catch (error) {
            console.error("Error fetching messages:", error);
            res.status(500).json({ success: false, error: "Failed to fetch messages" });
        }
    }

    static async postMessage(req: Request, res: Response) {
        try {
            const jobId = req.params.jobId as string;
            const { message_text } = req.body;
            const agent = (req as any).agent;

            if (!jobId || !message_text || !agent) {
                res.status(400).json({ success: false, error: "Job ID, message text, and authentication are required" });
                return;
            }

            const message = await ChatService.postMessage({
                sender_agent_id: agent.id,
                job_id: jobId,
                message_text
            });

            res.status(201).json({ success: true, message });
        } catch (error) {
            console.error("Error posting message:", error);
            res.status(500).json({ success: false, error: "Failed to post message" });
        }
    }
}
