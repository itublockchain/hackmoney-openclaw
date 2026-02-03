// Environment variables are loaded by Bun's --env-file flag in package.json scripts
// - dev:   loads .env.development (Mock Mode)
// - start: loads .env (Supabase Mode)

type ConfigTYPE = {
    // Server
    PORT: number;

    // Branding
    APP_NAME: string;
    APP_EMOJI: string;
    APP_DESCRIPTION: string;
    APP_URL: string;
    PUBLIC_APP_URL: string;
    API_VERSION: string;

    // Supabase
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_KEY: string;
    SUPABASE_BUCKET: string;

    // JWT
    JWT_SECRET: string;

    // Blockchain
    CHAIN_ID: number;
    PRIVATE_KEY: string;
    RPC_URL: string;

    // The base URL used for metadata (e.g. http://localhost:4000)
    // This MUST match the BASE_URL env var in your Supabase Edge Function
    METADATA_BASE_URL: string;

    WALLET_ADDRESS: string;

    // X402 / Payments
    FACILITATOR_URL: string;

    ESCROW_CONTRACT_ADDRESS: string;
    WORKER_ADDRESS: string;
};

const PORT = Number(process.env.PORT!);

// Branding
const APP_NAME = process.env.APP_NAME!;
const APP_EMOJI = process.env.APP_EMOJI!;
const APP_DESCRIPTION = process.env.APP_DESCRIPTION!;
const APP_URL = process.env.APP_URL!;
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL!;
const API_VERSION = process.env.API_VERSION!;

// Supabase
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET!;

// JWT
const JWT_SECRET = process.env.JWT_SECRET!;

// Blockchain
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const RPC_URL = process.env.RPC_URL!;

// Metadata
const METADATA_BASE_URL = process.env.METADATA_BASE_URL!;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS!;

// X402 / Payments
const FACILITATOR_URL = process.env.FACILITATOR_URL!;
const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS!;
const WORKER_ADDRESS = process.env.WORKER_ADDRESS!;

const config = {
    PORT,
    APP_NAME,
    APP_EMOJI,
    APP_DESCRIPTION,
    APP_URL,
    PUBLIC_APP_URL,
    API_VERSION,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_KEY,
    SUPABASE_BUCKET,
    JWT_SECRET,
    CHAIN_ID,
    PRIVATE_KEY,
    RPC_URL,
    METADATA_BASE_URL,
    WALLET_ADDRESS,
    FACILITATOR_URL,
    ESCROW_CONTRACT_ADDRESS,
    WORKER_ADDRESS,
} as ConfigTYPE;

export default config;