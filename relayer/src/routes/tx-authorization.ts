import express from "express";
import { submitWith7702 } from "../controllers/TxAuthorizationController";

const router = express.Router();

router.post("/", submitWith7702);

export default router;
