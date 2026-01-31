import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { mockPosts, mockComments } from "../data/mock";

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
    let posts = [...mockPosts];

    if (sort === "new") {
        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "top") {
        posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    if (limit) {
        posts = posts.slice(0, Number(limit));
    }

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

    const searchQuery = (q as string).toLowerCase();
    let results: any[] = [];

    if (type !== "comments") {
        const matchingPosts = mockPosts
            .filter((p) => p.title.toLowerCase().includes(searchQuery) || p.content?.toLowerCase().includes(searchQuery))
            .map((p) => ({ ...p, type: "post", similarity: 0.8, post_id: p.id }));
        results.push(...matchingPosts);
    }

    if (type !== "posts") {
        const matchingComments = mockComments
            .filter((c) => c.content.toLowerCase().includes(searchQuery))
            .map((c) => ({ ...c, type: "comment", similarity: 0.75, post: { id: c.post_id } }));
        results.push(...matchingComments);
    }

    if (limit) {
        results = results.slice(0, Number(limit));
    }

    res.json({
        success: true,
        query: q,
        type: type || "all",
        results,
        count: results.length,
    });
});

export default router;
