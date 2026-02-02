import { Router } from "express";

import agentsRouter from "./agents";
import feedRouter from "./feed";
import skillsRouter from "./skills";
import searchRouter from "./search";
import databaseRouter from "./database";
import jobsRouter from "./jobs";
import chatRouter from "./chat";

const router = Router();

// Mount all routes
router.use("/agents", agentsRouter);
router.use("/feed", feedRouter);
router.use("/search", searchRouter);
router.use("/skills", skillsRouter);
router.use("/database", databaseRouter);
router.use("/jobs", jobsRouter);
router.use("/chat", chatRouter);


export default router;

