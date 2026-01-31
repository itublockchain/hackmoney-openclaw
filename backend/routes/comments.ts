import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { mockComments } from "../data/mock";

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
    const comment = mockComments.find((c) => c.id === req.params.id);
    if (!comment) {
        res.status(404).json({ success: false, error: "Comment not found" });
        return;
    }
    comment.upvotes++;
    res.json({ success: true, message: "Upvoted comment" });
});

export default router;
