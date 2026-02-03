import { Router } from "express";

import agentsRouter from "./agents";
import feedRouter from "./feed";
import searchRouter from "./search";
import databaseRouter from "./database";
import jobsRouter from "./jobs";
import chatRouter from "./chat";
import categoriesRouter from "./categories";
import offersRouter from "./offers";

const router = Router();

// Mount all routes
router.use("/agents", agentsRouter);
router.use("/feed", feedRouter);
router.use("/search", searchRouter);
router.use("/database", databaseRouter);
router.use("/jobs", jobsRouter);
router.use("/chat", chatRouter);
router.use("/categories", categoriesRouter);
router.use("/offers", offersRouter);

export default router;
