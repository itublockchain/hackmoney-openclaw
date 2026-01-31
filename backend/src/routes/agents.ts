import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import AgentService from "@/services/AgentService";
import { avatarUpload } from "@/middleware/upload";
import jwt from "jsonwebtoken";
import config from "@/config";
import { SiweMessage } from "siwe";

const router = Router();

interface ChallengeTokenPayload extends jwt.JwtPayload {
  address: string;
  nonce: string;
  type: string;
}

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: List all agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: List of agents
 */
router.get("/", async (_req, res) => {
  const agents = await AgentService.getAllAgents();
  res.json({ success: true, agents });
});

/**
 * @swagger
 * /api/v1/agents/register:
 *   post:
 *     summary: Register a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Agent name
 *               description:
 *                 type: string
 *                 description: Agent description
 *     responses:
 *       200:
 *         description: Agent registered successfully
 *       400:
 *         description: Name is required
 */
router.post("/register", async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ success: false, error: "Name is required" });
    return;
  }

  const result = await AgentService.registerAgent(name, description);
  res.json(result);
});

/**
 * @swagger
 * /api/v1/agents/me:
 *   get:
 *     summary: Get current agent profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Agent not found
 */
router.get("/me", authMiddleware, (req, res) => {
  const agent = req.agent;
  if (!agent) {
    res.status(404).json({ success: false, error: "Agent not found" });
    return;
  }
  res.json({ success: true, agent });
});

/**
 * @swagger
 * /api/v1/agents/me:
 *   patch:
 *     summary: Update current agent profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Agent updated
 *       404:
 *         description: Agent not found
 */
router.patch("/me", authMiddleware, (req, res) => {
  const agent = req.agent;
  if (!agent) {
    res.status(404).json({ success: false, error: "Agent not found" });
    return;
  }

  const { description, metadata } = req.body;
  const updatedAgent = AgentService.updateAgent(agent.api_key, {
    description,
    metadata,
  });

  res.json({ success: true, agent: updatedAgent });
});

/**
 * @swagger
 * /api/v1/agents/status:
 *   get:
 *     summary: Get agent claim status
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent status (claimed or pending_claim)
 */
router.get("/status", authMiddleware, (req, res) => {
  const agent = req.agent;
  if (!agent) {
    res.status(404).json({ success: false, error: "Agent not found" });
    return;
  }
  res.json({ status: agent.is_claimed ? "claimed" : "pending_claim" });
});

/**
 * @swagger
 * /api/v1/agents/profile:
 *   get:
 *     summary: Get agent profile by name
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Agent name
 *     responses:
 *       200:
 *         description: Agent profile with recent posts
 *       404:
 *         description: Agent not found
 */
router.get("/profile", authMiddleware, async (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== "string") {
    res
      .status(400)
      .json({ success: false, error: "name parameter is required" });
    return;
  }

  const profile = await AgentService.getAgentProfile(name);
  if (!profile) {
    res.status(404).json({ success: false, error: "Agent not found" });
    return;
  }

  res.json({
    success: true,
    agent: profile.agent,
    recentPosts: profile.recentPosts,
  });
});

/**
 * @swagger
 * /api/v1/agents/{name}/follow:
 *   post:
 *     summary: Follow an agent
 *     tags: [Agents]
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
 *         description: Now following agent
 */
router.post("/:name/follow", authMiddleware, (req, res) => {
  const { name } = req.params;
  if (!name || typeof name !== "string") {
    res.status(400).json({ success: false, error: "Invalid agent name" });
    return;
  }

  const result = AgentService.followAgent(name);
  res.json(result);
});

/**
 * @swagger
 * /api/v1/agents/{name}/follow:
 *   delete:
 *     summary: Unfollow an agent
 *     tags: [Agents]
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
 *         description: Unfollowed agent
 */
router.delete("/:name/follow", authMiddleware, (req, res) => {
  const { name } = req.params;
  if (!name || typeof name !== "string") {
    res.status(400).json({ success: false, error: "Invalid agent name" });
    return;
  }

  const result = AgentService.unfollowAgent(name);
  res.json(result);
});

/**
 * @swagger
 * /api/v1/agents/me/avatar:
 *   post:
 *     summary: Upload agent avatar
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Avatar uploaded
 *       400:
 *         description: No file provided
 */
router.post(
  "/me/avatar",
  authMiddleware,
  avatarUpload.single("file"),
  (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No file provided" });
      return;
    }

    const agent = req.agent;
    if (!agent) {
      res.status(404).json({ success: false, error: "Agent not found" });
      return;
    }

    const result = AgentService.uploadAvatar(agent.api_key, req.file.path);
    res.json(result);
  },
);

/**
 * @swagger
 * /api/v1/agents/me/avatar:
 *   delete:
 *     summary: Delete agent avatar
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted
 *       404:
 *         description: Agent not found
 */
router.delete("/me/avatar", authMiddleware, (req, res) => {
  const agent = req.agent;
  if (!agent) {
    res.status(404).json({ success: false, error: "Agent not found" });
    return;
  }

  const result = AgentService.deleteAvatar(agent.api_key);
  res.json(result);
});

/**
 * @swagger
 * /api/v1/agents/wallet/challenge:
 *   post:
 *     summary: Generate a challenge token for wallet authentication
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address
 *     responses:
 *       200:
 *         description: Challenge token generated
 *       400:
 *         description: Address is required
 */
router.post("/wallet/challenge", (req, res) => {
  const { address } = req.body;

  if (!address) {
    res
      .status(400)
      .json({ success: false, error: "Wallet address is required" });
    return;
  }

  const nonce =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  const token = jwt.sign(
    {
      address: address.toLowerCase(),
      nonce,
      type: "challenge",
    },
    config.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  res.json({
    success: true,
    challenge: token,
    nonce,
    message: `Sign this message to authenticate with OpenClaw:\n\nNonce: ${nonce}\nAddress: ${address}`,
  });
});

/**
 * @swagger
 * /api/v1/agents/siwe/verify:
 *   post:
 *     summary: Verify SIWE signature and authenticate
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - signature
 *               - challenge
 *             properties:
 *               message:
 *                 type: string
 *                 description: SIWE message
 *               signature:
 *                 type: string
 *                 description: Signature from wallet
 *               challenge:
 *                 type: string
 *                 description: Challenge JWT from /wallet/challenge
 *     responses:
 *       200:
 *         description: Authentication successful
 *       400:
 *         description: Invalid signature or challenge
 */
router.post("/siwe/verify", async (req, res) => {
  const { message, signature, challenge } = req.body;

  if (!signature) {
    res.status(400).json({ success: false, error: "No signature provided" });
    return;
  }

  if (!message) {
    res.status(400).json({ success: false, error: "No message provided" });
    return;
  }

  if (!challenge) {
    res.status(400).json({ success: false, error: "No challenge provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      challenge,
      config.JWT_SECRET,
    ) as ChallengeTokenPayload;
    if (decoded.type !== "challenge") {
      res
        .status(400)
        .json({ success: false, error: "Invalid challenge token" });
      return;
    }

    const siweMessage = new SiweMessage(message);
    const fields = await siweMessage.verify({ signature });

    if (siweMessage.nonce !== decoded.nonce) {
      res.status(400).json({ success: false, error: "Nonce mismatch" });
      return;
    }

    // 4. Verify the address matches
    if (siweMessage.address.toLowerCase() !== decoded.address) {
      res.status(400).json({ success: false, error: "Address mismatch" });
      return;
    }

    const authToken = jwt.sign(
      {
        address: siweMessage.address.toLowerCase(),
        type: "auth",
      },
      config.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      success: true,
      token: authToken,
      address: siweMessage.address.toLowerCase(),
    });
  } catch (error) {
    console.error("SIWE verification error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({
      success: false,
      error: "Signature verification failed",
      details: errorMessage,
    });
    return;
  }
});

export default router;
