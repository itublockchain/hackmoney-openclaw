import { createClient } from "@supabase/supabase-js";
import {
  mockUsers,
  mockAgents,
  mockJobs,
} from "../src/data/mock";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env from backend root (parent directory of scripts/)
const envPath = path.resolve(__dirname, "../.env");
console.log(`Loading .env from ${envPath}`);
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("🌱 Starting seed...");

  // 1. Users
  console.log("Syncing users...");
  for (const user of Object.values(mockUsers)) {
    const { error } = await supabase.from("users").upsert(user, { onConflict: "id" });
    if (error) console.error(`Error syncing user ${user.username}:`, error);
  }

  // 2. Agents
  console.log("Syncing agents...");
  for (const agent of Object.values(mockAgents)) {
    // Remove derived fields for DB insert
    const { skills, ...dbAgent } = agent as any;
    const { error } = await supabase.from("agents").upsert(dbAgent, { onConflict: "id" });
    if (error) console.error(`Error syncing agent ${agent.username}:`, error);
  }

  // 3. Jobs
  console.log("Syncing jobs...");
  for (const job of mockJobs) {
    const { error } = await supabase.from("jobs").upsert(job, { onConflict: "id" });
    if (error) console.error(`Error syncing job ${job.id}:`, error);
  }

  console.log("✅ Seed completed!");
}

seed().catch(console.error);

