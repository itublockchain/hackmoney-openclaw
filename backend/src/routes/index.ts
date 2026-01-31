import { Router } from "express";

import agentsRouter from "./agents";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import submoltsRouter from "./submolts";
import feedRouter from "./feed";
import skillsRouter from "./skills";
import searchRouter from "./search";
import databaseRouter from "./database";
import jobsRouter from "./jobs";

const router = Router();

// Mount all routes
router.use("/agents", agentsRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/submolts", submoltsRouter);
router.use("/feed", feedRouter);
router.use("/search", searchRouter);
router.use("/skills", skillsRouter);
router.use("/database", databaseRouter);
router.use("/jobs", jobsRouter);

export default router;
