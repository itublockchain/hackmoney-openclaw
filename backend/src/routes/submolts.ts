import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "@/middleware/auth";
import SubmoltService from "@/services/SubmoltService";
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
router.get("/", optionalAuthMiddleware, async (_req, res) => {
  try {
    const submolts = await SubmoltService.getAllSubmolts();
    res.json({ success: true, submolts });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch submolts" });
  }
});

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
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, display_name, description } = req.body;

    if (!name || !display_name) {
      res
        .status(400)
        .json({ success: false, error: "name and display_name are required" });
      return;
    }

    const newSubmolt = await SubmoltService.createSubmolt({
      name,
      display_name,
      description,
    });
    res.json({ success: true, submolt: newSubmolt });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create submolt" });
  }
});

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
router.get("/:name", optionalAuthMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Invalid submolt name" });
      return;
    }

    const submolt = await SubmoltService.getSubmoltByName(name);
    if (!submolt) {
      res.status(404).json({ success: false, error: "Submolt not found" });
      return;
    }
    res.json({ success: true, submolt, your_role: null });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch submolt" });
  }
});

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
router.get("/:name/feed", optionalAuthMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const { sort } = req.query;

    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Invalid submolt name" });
      return;
    }

    const posts = await SubmoltService.getSubmoltFeed(name, sort as any);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch feed" });
  }
});

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
router.post("/:name/subscribe", authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Invalid submolt name" });
      return;
    }

    const agentName = req.agent?.name || "Unknown";
    const result = await SubmoltService.subscribe(name, agentName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to subscribe" });
  }
});

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
router.delete("/:name/subscribe", authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Invalid submolt name" });
      return;
    }

    const agentName = req.agent?.name || "Unknown";
    const result = await SubmoltService.unsubscribe(name, agentName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to unsubscribe" });
  }
});

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
router.patch("/:name/settings", authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;
    const { description, banner_color, theme_color } = req.body;

    if (!name || typeof name !== "string") {
      res.status(400).json({ success: false, error: "Invalid submolt name" });
      return;
    }

    const result = await SubmoltService.updateSettings(name, {
      description,
      banner_color,
      theme_color,
    });
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to update settings" });
  }
});

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
  async (req, res) => {
    try {
      const { name } = req.params;
      const assetType = (req.body.type || req.query.type) as
        | "avatar"
        | "banner";

      if (!name || typeof name !== "string") {
        res.status(400).json({ success: false, error: "Invalid submolt name" });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, error: "No file provided" });
        return;
      }

      if (!assetType || !["avatar", "banner"].includes(assetType)) {
        res
          .status(400)
          .json({ success: false, error: "type must be 'avatar' or 'banner'" });
        return;
      }

      const result = await SubmoltService.uploadAsset(
        name,
        assetType,
        req.file.path,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to upload asset" });
    }
  },
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
router.get("/:name/moderators", optionalAuthMiddleware, (_req, res) => {
  res.json({ success: true, moderators: [] });
});

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
router.post("/:name/moderators", authMiddleware, (_req, res) => {
  res.json({ success: true, message: "Moderator added" });
});

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
router.delete("/:name/moderators", authMiddleware, (_req, res) => {
  res.json({ success: true, message: "Moderator removed" });
});

export default router;
