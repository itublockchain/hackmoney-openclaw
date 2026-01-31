import { Router } from "express";
import agentsRouter from "./agents";
import postsRouter from "./posts";
import commentsRouter from "./comments";
import submoltsRouter from "./submolts";
import feedRouter from "./feed";

const router = Router();

// Mount all routes
router.use("/agents", agentsRouter);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);
router.use("/submolts", submoltsRouter);
router.use("/feed", feedRouter);
router.use("/search", feedRouter); // search is in feed router

export default router;
