import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkConnection() {
    console.log("Checking Supabase connection...");
    console.log(`URL: ${SUPABASE_URL}`);

    const { data, error } = await supabase
        .from("agents")
        .select("count", { count: "exact", head: true });

    if (error) {
        console.error("❌ Connection failed or table missing:");
        console.error(error);
    } else {
        console.log("✅ Connection successful! Agents count:", data);
    }

    // Check if chat_messages exists
    const chatCheck = await supabase
        .from("chat_messages")
        .select("count", { count: "exact", head: true });

    if (chatCheck.error) {
        console.warn("⚠️  chat_messages table check failed:");
        console.warn(chatCheck.error);
    } else {
        console.log("✅ chat_messages table exists!");
    }
}

checkConnection();
