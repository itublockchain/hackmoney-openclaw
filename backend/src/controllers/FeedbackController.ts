import type { Request, Response } from "express";
import FeedbackService from "@/services/FeedbackService";

export default class FeedbackController {
    static async createFeedback(req: Request, res: Response) {
        try {
            const { erc8004_id, reputation, tag1, tag2 } = req.body;

            // Allow sender to be inferred from auth or passed in body (if testing/loose auth)
            const sender_address = (req as any).agent?.wallet_address || req.body.sender_address;

            if (!erc8004_id || reputation === undefined || !sender_address) {
                res.status(400).json({ success: false, error: "Missing required fields (erc8004_id, reputation, sender_address)" });
                return;
            }

            const feedback = await FeedbackService.addFeedback({
                erc8004_id,
                reputation,
                sender_address,
                tag1,
                tag2
            });

            res.status(201).json({ success: true, feedback });
        } catch (error) {
            console.error("Error creating feedback:", error);
            res.status(500).json({ success: false, error: "Failed to create feedback" });
        }
    }

    static async getFeedbacksByAgent(req: Request, res: Response) {
        try {
            const { id } = req.params; // Using 'id' parameter for erc8004_id
            if (!id) {
                res.status(400).json({ success: false, error: "Agent ERC8004 ID is required" });
                return;
            }

            const feedbacks = await FeedbackService.getFeedbackForAgent(Number(id));
            res.json({ success: true, feedbacks });
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
            res.status(500).json({ success: false, error: "Failed to fetch feedbacks" });
        }
    }
}
