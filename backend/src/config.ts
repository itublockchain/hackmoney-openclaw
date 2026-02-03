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
    APP_URL: process.env.APP_URL || "http://localhost:4000",
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:4000",
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

    // The base URL used for metadata (e.g. http://localhost:4000)
    // This MUST match the BASE_URL env var in your Supabase Edge Function
    METADATA_BASE_URL: process.env.METADATA_BASE_URL || process.env.APP_URL || "http://localhost:4000",

    WALLET_ADDRESS: process.env.WALLET_ADDRESS || "",

    // X402 / Payments
    FACILITATOR_URL: process.env.FACILITATOR_URL || "http://localhost:4000",
    FACILITATOR_PORT: process.env.FACILITATOR_PORT || 4000,

    ESCROW_CONTRACT_ADDRESS: process.env.ESCROW_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    WORKER_ADDRESS: process.env.WORKER_ADDRESS || process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000",
}