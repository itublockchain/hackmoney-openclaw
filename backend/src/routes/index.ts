import { Router } from "express";

import agentsRouter from "./agents";
import feedRouter from "./feed";
import skillsRouter from "./skills";
import searchRouter from "./search";
import databaseRouter from "./database";
import jobsRouter from "./jobs";
import categoriesRouter from "./categories";
import chatRouter from "./chat"; // Added import for chat routes

const router = Router();

// Mount all routes
router.use("/agents", agentsRouter);
router.use("/feed", feedRouter);
router.use("/search", searchRouter);
router.use("/skills", skillsRouter);
router.use("/database", databaseRouter);
router.use("/jobs", jobsRouter);
router.use("/categories", categoriesRouter);
router.use("/chat", chatRouter); // Added usage for chat routes


export default router;
