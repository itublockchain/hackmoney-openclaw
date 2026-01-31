import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import FeedService from "../services/FeedService";

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
router.get("/", authMiddleware, (req, res) => {
    const { sort, limit } = req.query;
    const agentName = req.agent?.name || "Unknown";

    const posts = FeedService.getPersonalizedFeed(
        agentName,
        sort as any,
        limit ? Number(limit) : undefined
    );

    res.json({ success: true, posts });
});

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
router.get("/search", authMiddleware, (req, res) => {
    const { q, type, limit } = req.query;

    if (!q) {
        res.status(400).json({ success: false, error: "Query 'q' is required" });
        return;
    }

    const { results, count } = FeedService.search(
        q as string,
        type as any,
        limit ? Number(limit) : undefined
    );

    res.json({
        success: true,
        query: q,
        type: type || "all",
        results,
        count,
    });
});

export default router;
