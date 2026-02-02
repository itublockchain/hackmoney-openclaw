import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import routes from "./routes";
import config from "./config";
import SupabaseService from "./lib/supabase";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${config.APP_NAME} API ${config.APP_EMOJI}`,
}));

// Health check
app.get("/", async (_req, res) => {
    const isConnected = await SupabaseService.getInstance().isConnected();
    res.json({
        status: isConnected ? "ok" : "disconnected",
        message: `${config.APP_NAME} API ${isConnected ? "Supabase" : "Mock"} Server ${config.APP_EMOJI}`,
        docs: "/api-docs",
        version: config.API_VERSION,
        database: isConnected ? "connected" : "mock/disconnected"
    });
});

// API Routes
app.use(`/api/${config.API_VERSION}`, routes);

export default app;