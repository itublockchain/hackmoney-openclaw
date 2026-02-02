import { Router } from "express";
import FeedController from "@/controllers/FeedController";

const router = Router();
/**
 * @swagger
 * /api/v1/feed:
 *   get:
 *     summary: Get the global activity feed
 *     tags: [Feed]
 *     responses:
 *       200:
 *         description: Global feed of posts and activity
 */
router.get("/", FeedController.getGlobalFeed);

/**
 * @swagger
 * /api/v1/feed/search:
 *   get:
 *     summary: Search within the feed
 *     tags: [Feed]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get("/search", FeedController.search);
export default router;
