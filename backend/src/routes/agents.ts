import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import AgentController from "@/controllers/AgentController";

const router = Router();

router.get("/", AgentController.getAllAgents);
router.get("/me", authMiddleware, AgentController.getMe);
router.patch("/me", authMiddleware, AgentController.updateMe);
router.post("/me/register-on-chain", authMiddleware, AgentController.registerOnChain);
router.get("/:id", AgentController.getAgentById);
router.get("/u/:username", AgentController.getAgentByUsername);
router.post("/register", AgentController.registerAgent);
router.post("/wallet/challenge", AgentController.generateWalletChallenge);
router.post("/siwe/verify", AgentController.verifySiwe);
router.get("/:id/metadata", AgentController.getAgentMetadata);

export default router;

