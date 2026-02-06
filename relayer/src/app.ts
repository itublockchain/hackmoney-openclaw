import express from "express";
import cors from "cors";
import routes from "./routes";
import config from "./config";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", async (_req, res) => {
    res.json({
        status: "ok",
        version: config.API_VERSION,
    });
});

// API Routes
app.use(`/api/${config.API_VERSION}`, routes);

export default app;