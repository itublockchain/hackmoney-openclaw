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

// Proxy to Relayer Service (Moved before body parser to ensure stream integrity)
if (config.RELAYER_URL) {
    const { createProxyMiddleware } = require('http-proxy-middleware');

    // Proxy for Tx Authorization and Relay Register
    const relayerProxy = createProxyMiddleware({
        target: config.RELAYER_URL,
        changeOrigin: true,
        pathRewrite: {
            [`^/api/${config.API_VERSION}`]: `/api/${config.API_VERSION}`,
        },
    });

    app.use(`/api/${config.API_VERSION}/tx-authorization`, relayerProxy);
    app.use(`/api/${config.API_VERSION}/relay-register`, relayerProxy);
}

app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${config.APP_NAME} API ${config.APP_EMOJI}`,
}));

// Health check
app.get("/", async (_req, res) => {
    const isConnected = await SupabaseService.getInstance().isConnected();
    const isProd = process.env.NODE_ENV === "production";

    res.json({
        status: isConnected ? "ok" : (isProd ? "error" : "disconnected"),
        message: `${config.APP_NAME} API ${isProd ? "Production" : (isConnected ? "Supabase" : "Mock")} Server ${config.APP_EMOJI}`,
        docs: "/api-docs",
        version: config.API_VERSION,
        database: isConnected ? "connected" : (isProd ? "failed/production" : "mock/disconnected")
    });
});

// API Routes
app.use(`/api/${config.API_VERSION}`, routes);

export default app;