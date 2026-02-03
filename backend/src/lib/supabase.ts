import { createClient, SupabaseClient } from "@supabase/supabase-js";
import config from "@/config";

class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient | null = null;
  private initialized: boolean = false;

  private constructor() { }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  public getClient(): SupabaseClient {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.client) {
      throw new Error(
        "Supabase client not initialized. Check your SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.",
      );
    }

    return this.client;
  }

  private initialize(): void {
    const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = config;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "Supabase credentials configured. Production mode REQUIRES valid SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.",
        );
      }

      console.warn(
        "\x1b[90m%s\x1b[0m", // Gray color
        "⚠️  Supabase credentials not configured (Running in Mock Mode)",
      );
      this.initialized = true;
      return;
    }

    try {
      this.client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.initialized = true;
      const mode = process.env.NODE_ENV === "production" ? "Production" : "Supabase";
      console.log(`✅ ${mode} client initialized successfully`);
    } catch (error) {
      console.error("❌ Failed to initialize Supabase client:", error);
      this.initialized = true;
    }
  }

  public async isConnected(): Promise<boolean> {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.client) {
      return false;
    }

    try {
      const { error } = await this.client
        .from("agents")
        .select("count", { count: "exact", head: true });
      return !error;
    } catch {
      return false;
    }
  }
}

export const supabase = () => SupabaseService.getInstance().getClient();
export default SupabaseService;
