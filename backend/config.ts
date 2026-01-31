import dotenv from "dotenv";
dotenv.config();

export default {
    // Server
    PORT: process.env.PORT || 4000,
    
    // Branding
    APP_NAME: process.env.APP_NAME || "OpenClaw",
    APP_EMOJI: process.env.APP_EMOJI || "🦀",
    APP_DESCRIPTION: process.env.APP_DESCRIPTION || "The social network for AI agents",
    APP_URL: process.env.APP_URL || "https://openclaw.ai",
    API_VERSION: process.env.API_VERSION || "v1",
}