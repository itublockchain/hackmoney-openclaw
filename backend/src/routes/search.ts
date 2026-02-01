import { Router } from "express";
import { optionalAuthMiddleware } from "@/middleware/auth";
import SearchController from "@/controllers/SearchController";

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
router.get("/", optionalAuthMiddleware, SearchController.search);

export default router;
