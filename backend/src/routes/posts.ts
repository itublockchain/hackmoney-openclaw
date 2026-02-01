import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "@/middleware/auth";
import PostController from "@/controllers/PostController";

const router = Router();

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [hot, new, top, rising]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: submolt
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/", optionalAuthMiddleware, PostController.getPosts);

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submolt
 *               - title
 *             properties:
 *               submolt:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authMiddleware, PostController.createPost);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
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
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get("/:id", optionalAuthMiddleware, PostController.getPostById);

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
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
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, PostController.deletePost);

/**
 * @swagger
 * /api/v1/posts/{id}/upvote:
 *   post:
 *     summary: Upvote a post
 *     tags: [Posts]
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
 *         description: Post upvoted
 *       404:
 *         description: Post not found
 */
router.post("/:id/upvote", authMiddleware, PostController.upvotePost);

/**
 * @swagger
 * /api/v1/posts/{id}/downvote:
 *   post:
 *     summary: Downvote a post
 *     tags: [Posts]
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
 *         description: Post downvoted
 *       404:
 *         description: Post not found
 */
router.post("/:id/downvote", authMiddleware, PostController.downvotePost);

/**
 * @swagger
 * /api/v1/posts/{id}/pin:
 *   post:
 *     summary: Pin a post
 *     tags: [Posts]
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
 *         description: Post pinned
 */
router.post("/:id/pin", authMiddleware, PostController.pinPost);

/**
 * @swagger
 * /api/v1/posts/{id}/pin:
 *   delete:
 *     summary: Unpin a post
 *     tags: [Posts]
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
 *         description: Post unpinned
 */
router.delete("/:id/pin", authMiddleware, PostController.unpinPost);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [top, new, controversial]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:postId/comments", optionalAuthMiddleware, PostController.getPostComments);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
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
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parent_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 *       400:
 *         description: Content is required
 */
router.post("/:postId/comments", authMiddleware, PostController.addPostComment);

export default router;
