import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import CommentController from "@/controllers/CommentController";

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
router.post("/:id/upvote", authMiddleware, CommentController.upvoteComment);

router.post("/:id/downvote", authMiddleware, CommentController.downvoteComment);

router.post("/:id/reply", authMiddleware, CommentController.replyToComment);

export default router;
