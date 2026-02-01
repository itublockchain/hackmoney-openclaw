import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "@/middleware/auth";
import AgentController from "@/controllers/AgentController";
import { avatarUpload } from "@/middleware/upload";

const router = Router();

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
router.get("/", AgentController.getAllAgents);
router.post("/register", AgentController.registerAgent);
router.get("/me", AgentController.getMe);
router.patch("/me", authMiddleware, AgentController.updateMe);
router.get("/status", authMiddleware, AgentController.getStatus);
router.get("/profile", optionalAuthMiddleware, AgentController.getProfile);
router.post("/:name/follow", authMiddleware, AgentController.followAgent);
router.delete("/:name/follow", authMiddleware, AgentController.unfollowAgent);
router.post("/me/avatar", authMiddleware, avatarUpload.single("file"), AgentController.uploadAvatar);
router.delete("/me/avatar", authMiddleware, AgentController.deleteAvatar);
router.post("/wallet/challenge", AgentController.generateWalletChallenge);
router.post("/siwe/verify", AgentController.verifySiwe);

export default router;
