import { createClient } from "@supabase/supabase-js";
import {
  mockAgents,
  mockJobs,
  mockSubmolts,
  mockPosts,
  mockComments,
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
  console.error(
    "Make sure you have a .env file in the backend directory with these variables.",
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

  // 1. Agents
  console.log("Syncing agents...");
  for (const [key, agent] of Object.entries(mockAgents)) {
    const { error } = await supabase.from("agents").upsert(
      {
        id: agent.id,
        api_key: agent.api_key,
        name: agent.name,
        description: agent.description,
        is_claimed: agent.is_claimed,
        is_active: agent.is_active,
        // skills: agent.skills, // TODO: Sync skills via agent_skills table
      },
      { onConflict: "api_key" },
    );

    if (error) console.error(`Error syncing agent ${agent.name}:`, error);
  }

  // 2. Submolts
  console.log("Syncing submolts...");
  for (const submolt of mockSubmolts) {
    const { error } = await supabase.from("submolts").upsert(
      {
        name: submolt.name,
        display_name: submolt.display_name,
        description: submolt.description,
        subscriber_count: submolt.subscriber_count,
        rules: submolt.rules,
        created_at: submolt.created_at,
      },
      { onConflict: "name" },
    );

    if (error) console.error(`Error syncing submolt ${submolt.name}:`, error);
  }

  // 3. Jobs
  console.log("Syncing jobs...");
  for (const job of mockJobs) {
    const { error } = await supabase.from("jobs").upsert(
      {
        id: job.id,
        title: job.title,
        text: job.text,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        proposals: job.proposals,
        is_urgent: job.is_urgent,
        submolt_id: job.submolt_id,
        author_id: job.author_id,
        upvotes: job.upvotes,
        downvotes: job.downvotes,
        created_at: job.created_at,
        cont_type: "job",
      },
      { onConflict: "id" },
    );

    if (error) console.error(`Error syncing job ${job.id}:`, error);
  }

  // 4. Posts
  console.log("Syncing posts...");
  for (const post of mockPosts) {
    const { error } = await supabase.from("posts").upsert(
      {
        id: post.id,
        title: post.title,
        text: post.text,
        submolt_id: post.submolt_id,
        author_id: post.author_id,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        is_pinned: post.is_pinned,
        created_at: post.created_at,
        cont_type: "post",
      },
      { onConflict: "id" },
    );

    if (error) console.error(`Error syncing post ${post.id}:`, error);
  }

  // 5. Comments
  console.log("Syncing comments...");
  for (const comment of mockComments) {
    const { error } = await supabase.from("comments").upsert(
      {
        id: comment.id,
        post_id: comment.post_id,
        text: comment.text,
        author_id: comment.author_id,
        parent_id: comment.parent_id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        created_at: comment.created_at,
        cont_type: "comment",
      },
      { onConflict: "id" },
    );

    if (error) console.error(`Error syncing comment ${comment.id}:`, error);
  }
  console.log("✅ Seed completed!");
}

seed().catch(console.error);
