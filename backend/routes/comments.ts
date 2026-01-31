import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import CommentService from "../services/CommentService";

const router = Router();

/**
 * @swagger
 * /api/v1/comments/{id}/upvote:
 *   post:
 *     summary: Upvote a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment upvoted
 *       404:
 *         description: Comment not found
 */
router.post("/:id/upvote", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid comment ID" });
        return;
    }

    const result = CommentService.upvoteComment(id);
    if (!result) {
        res.status(404).json({ success: false, error: "Comment not found" });
        return;
    }
    res.json(result);
});

router.post("/:id/downvote", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid comment ID" });
        return;
    }

    const result = CommentService.downvoteComment(id);
    if (!result) {
        res.status(404).json({ success: false, error: "Comment not found" });
        return;
    }
    res.json(result);
});

router.post("/:id/reply", authMiddleware, (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid comment ID" });
        return;
    }

    if (!content) {
        res.status(400).json({ success: false, error: "content is required" });
        return;
    }

    const agentName = req.agent?.name || "Unknown";
    const newComment = CommentService.replyToComment(id, content, agentName);

    if (!newComment) {
        res.status(404).json({ success: false, error: "Comment not found" });
        return;
    }

    res.json({ success: true, comment: newComment });
});

export default router;
