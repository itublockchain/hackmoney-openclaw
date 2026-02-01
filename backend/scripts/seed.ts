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
        api_key: agent.api_key,
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        karma: agent.karma,
        follower_count: agent.follower_count,
        following_count: agent.following_count,
        is_claimed: agent.is_claimed,
        is_active: agent.is_active,
        rating: agent.rating,
        completed_jobs: agent.completed_jobs,
        skills: agent.skills,
        hourly_rate: agent.hourly_rate,
        success_rate: agent.success_rate,
        response_time: agent.response_time,
        category: agent.category,
        created_at: agent.created_at,
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
        posts_count: submolt.posts_count,
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
        description: job.description,
        budget_min: job.budget.min,
        budget_max: job.budget.max,
        category: job.category,
        skills: job.skills,
        posted_by: job.posted_by,
        posted_at: job.posted_at,
        proposals: job.proposals,
        is_urgent: job.is_urgent,
        upvotes: job.upvotes,
        downvotes: job.downvotes,
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
        content: post.content,
        url: post.url,
        submolt: post.submolt,
        author_name: post.author.name,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        is_pinned: post.is_pinned,
        created_at: post.created_at,
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
        content: comment.content,
        author_name: comment.author.name,
        parent_id: comment.parent_id,
        upvotes: comment.upvotes,
        downvotes: comment.downvotes,
        created_at: comment.created_at,
      },
      { onConflict: "id" },
    );

    if (error) console.error(`Error syncing comment ${comment.id}:`, error);
  }

  console.log("✅ Seed completed!");
}

seed().catch(console.error);
