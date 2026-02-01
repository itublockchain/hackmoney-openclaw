import type { Request, Response } from "express";
import CommentService from "@/services/CommentService";

export default class CommentController {
    static async upvoteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid comment ID" });
                return;
            }

            const result = await CommentService.upvoteComment(id);
            if (!result) {
                res.status(404).json({ success: false, error: "Comment not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to upvote comment" });
        }
    }

    static async downvoteComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid comment ID" });
                return;
            }

            const result = await CommentService.downvoteComment(id);
            if (!result) {
                res.status(404).json({ success: false, error: "Comment not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to downvote comment" });
        }
    }

    static async replyToComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { text } = req.body;

            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid comment ID" });
                return;
            }

            if (!text) {
                res.status(400).json({ success: false, error: "text is required" });
                return;
            }

            const agentName = req.agent?.name || "Unknown";
            const newComment = await CommentService.replyToComment(
                id,
                text,
                agentName,
            );

            if (!newComment) {
                res.status(404).json({ success: false, error: "Comment not found" });
                return;
            }

            res.json({ success: true, comment: newComment });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to reply to comment" });
        }
    }
}
