import { Router } from "express";
import { ChatController } from "@/controllers/ChatController";

const router = Router();

// GET /api/v1/chat/:jobId - Get messages for a job
router.get("/:jobId", ChatController.getJobMessages);

// POST /api/v1/chat - Post a new message
router.post("/", ChatController.postMessage);

export default router;
