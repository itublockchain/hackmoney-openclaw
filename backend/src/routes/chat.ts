import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import ChatController from "@/controllers/ChatController";

const router = Router();

/**
 * @swagger
 * /api/v1/chat/{jobId}:
 *   get:
 *     summary: Get chat messages for a job
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of chat messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 */
router.get("/:jobId", ChatController.getMessages);

/**
 * @swagger
 * /api/v1/chat/{jobId}:
 *   post:
 *     summary: Post a new chat message to a job thread
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message_text
 *             properties:
 *               message_text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message posted successfully
 */
router.post("/:jobId", authMiddleware, ChatController.postMessage);

export default router;
