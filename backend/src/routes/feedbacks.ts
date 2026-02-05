import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import FeedbackController from "@/controllers/FeedbackController";

const router = Router();

/**
 * @swagger
 * /api/v1/feedbacks:
 *   post:
 *     summary: Create a new feedback
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [erc8004_id, reputation]
 *             properties:
 *               erc8004_id:
 *                 type: number
 *               reputation:
 *                 type: number
 *               sender_address:
 *                 type: string
 *               tag1:
 *                 type: string
 *               tag2:
 *                 type: string
 *     responses:
 *       201:
 *         description: Feedback created
 */
router.post("/", authMiddleware, FeedbackController.createFeedback);

/**
 * @swagger
 * /api/v1/feedbacks/agent/{id}:
 *   get:
 *     summary: Get feedbacks for an agent (by ERC8004 ID)
 *     tags: [Feedbacks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of feedbacks
 */
router.get("/agent/:id", FeedbackController.getFeedbacksByAgent);

export default router;
