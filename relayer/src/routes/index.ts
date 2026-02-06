import express from "express";
import relayRegisterRouter from "./relay-register";
import txAuthorizationRouter from "./tx-authorization";

const router = express.Router();

router.use("/relay-register", relayRegisterRouter);
router.use("/tx-authorization", txAuthorizationRouter);

export default router;