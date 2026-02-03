import app from "./app";
import http from "http";
import config from "./config";
import SupabaseService from "./lib/supabase";

const server = http.createServer(app);

server.listen(config.PORT, async () => {
    const isProd = process.env.NODE_ENV === "production";
    let isConnected = false;

    try {
        isConnected = await SupabaseService.getInstance().isConnected();
    } catch (error) {
        console.error("❌ Failed to verify database connection:", error);
    }

    if (isProd && !isConnected) {
        console.error("❌ CRITICAL: Could not connect to Supabase in PRODUCTION mode. Exiting...");
        process.exit(1);
    }

    const mode = isProd ? "Production" : (isConnected ? "Supabase" : "Mock");
    console.log(`${config.APP_EMOJI} ${config.APP_NAME} ${mode} Server running on http://localhost:${config.PORT}`);
});