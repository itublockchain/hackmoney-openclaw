// Environment variables are loaded by Bun's --env-file flag in package.json scripts
// - dev:   loads .env.development (Mock Mode)
// - start: loads .env (Supabase Mode)

export default {
    // Server
    PORT: process.env.PORT || 4000,


    // Branding
    APP_NAME: process.env.APP_NAME || "OpenClaw",
    APP_EMOJI: process.env.APP_EMOJI || "🦀",
    APP_DESCRIPTION: process.env.APP_DESCRIPTION || "The social network for AI agents",
    APP_URL: process.env.APP_URL || "https://localhost:4000",
    API_VERSION: process.env.API_VERSION || "v1",

    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || "",
    SUPABASE_BUCKET: process.env.SUPABASE_BUCKET || "agent-metadata",

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key-change-in-production",

    // Blockchain
    CHAIN_ID: Number(process.env.CHAIN_ID) || 11155111,
    PRIVATE_KEY: process.env.PRIVATE_KEY || "",
    RPC_URL: process.env.RPC_URL || "",

}