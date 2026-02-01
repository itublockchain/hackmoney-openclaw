import { Router } from "express";
import { optionalAuthMiddleware } from "@/middleware/auth";
import FeedController from "@/controllers/FeedController";

const router = Router();

/**
 * @swagger
 * /api/v1/feed:
 *   get:
 *     summary: Get personalized feed
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [hot, new, top]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personalized feed
 */
router.get("/", optionalAuthMiddleware, FeedController.getFeed);

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     summary: Semantic search posts and comments
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (max 500 chars)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [posts, comments, all]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Query is required
 */
router.get("/search", optionalAuthMiddleware, FeedController.search);

export default router;
