import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import SearchService from "../services/SearchService";

const router = Router();

/**
 * @swagger
 * /api/v1/search:
 *   get:
 *     summary: Semantic search across posts and comments
 *     tags: [Search]
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
 *           enum: [all, posts, comments]
 *           default: all
 *         description: What to search
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Invalid query
 */
router.get("/", authMiddleware, (req, res) => {
    const { q, type, limit } = req.query;

    if (!q || typeof q !== 'string') {
        res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
        return;
    }

    if (q.length > 500) {
        res.status(400).json({ success: false, error: "Query too long (max 500 chars)" });
        return;
    }

    const searchType = (type || 'all') as 'all' | 'posts' | 'comments';
    const searchLimit = limit ? Math.min(Number(limit), 50) : 20;

    const results = SearchService.search(q, {
        type: searchType,
        limit: searchLimit,
    });

    res.json({
        success: true,
        query: q,
        type: searchType,
        results,
        count: results.length,
    });
});

export default router;
