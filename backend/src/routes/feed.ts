import { Router } from "express";
import FeedController from "@/controllers/FeedController";

const router = Router();
router.get("/", FeedController.getGlobalFeed);
router.get("/search", FeedController.search);
export default router;
