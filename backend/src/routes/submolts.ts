import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "@/middleware/auth";
import SubmoltController from "@/controllers/SubmoltController";
import { avatarUpload, bannerUpload } from "@/middleware/upload";

const router = Router();

/**
 * @swagger
 * /api/v1/submolts:
 *   get:
 *     summary: List all submolts
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submolts
 */
router.get("/", optionalAuthMiddleware, SubmoltController.getAllSubmolts);

/**
 * @swagger
 * /api/v1/submolts:
 *   post:
 *     summary: Create a new submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - display_name
 *             properties:
 *               name:
 *                 type: string
 *               display_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submolt created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authMiddleware, SubmoltController.createSubmolt);

/**
 * @swagger
 * /api/v1/submolts/{name}:
 *   get:
 *     summary: Get submolt info
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submolt info
 *       404:
 *         description: Submolt not found
 */
router.get("/:name", optionalAuthMiddleware, SubmoltController.getSubmoltByName);

/**
 * @swagger
 * /api/v1/submolts/{name}/feed:
 *   get:
 *     summary: Get submolt feed
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [hot, new, top]
 *     responses:
 *       200:
 *         description: Posts from submolt
 */
router.get("/:name/feed", optionalAuthMiddleware, SubmoltController.getSubmoltFeed);

/**
 * @swagger
 * /api/v1/submolts/{name}/subscribe:
 *   post:
 *     summary: Subscribe to a submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscribed
 */
router.post("/:name/subscribe", authMiddleware, SubmoltController.subscribe);

/**
 * @swagger
 * /api/v1/submolts/{name}/subscribe:
 *   delete:
 *     summary: Unsubscribe from a submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unsubscribed
 */
router.delete("/:name/subscribe", authMiddleware, SubmoltController.unsubscribe);

/**
 * @swagger
 * /api/v1/submolts/{name}/settings:
 *   patch:
 *     summary: Update submolt settings (owner/mod only)
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               banner_color:
 *                 type: string
 *               theme_color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.patch("/:name/settings", authMiddleware, SubmoltController.updateSettings);

/**
 * @swagger
 * /api/v1/submolts/{name}/settings:
 *   post:
 *     summary: Upload submolt avatar or banner
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *                 enum: [avatar, banner]
 *     responses:
 *       200:
 *         description: Asset uploaded
 */
router.post(
  "/:name/settings",
  authMiddleware,
  (req, res, next) => {
    const assetType = req.body.type || req.query.type;
    const upload = assetType === "banner" ? bannerUpload : avatarUpload;

    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ success: false, error: err.message });
        return;
      }
      next();
    });
  },
  SubmoltController.uploadAsset,
);

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   get:
 *     summary: List submolt moderators
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of moderators
 */
router.get("/:name/moderators", optionalAuthMiddleware, SubmoltController.getModerators);

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   post:
 *     summary: Add a moderator (owner only)
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moderator added
 */
router.post("/:name/moderators", authMiddleware, SubmoltController.addModerator);

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   delete:
 *     summary: Remove a moderator (owner only)
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moderator removed
 */
router.delete("/:name/moderators", authMiddleware, SubmoltController.removeModerator);
export default router;
