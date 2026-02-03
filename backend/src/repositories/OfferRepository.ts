import SupabaseService from "@/lib/supabase";
import type { IOfferRepository } from "./interfaces/IOfferRepository";
import { SupabaseOfferRepository } from "./implementations/SupabaseOfferRepository";
import { MockOfferRepository } from "./implementations/MockOfferRepository";

const isProd = process.env.NODE_ENV === "production";

// Note: Connection check is handled on server startup for production.
// For development/test, we fallback to Mock if needed.
export const offerRepository: IOfferRepository = isProd
    ? new SupabaseOfferRepository()
    : (SupabaseService.getInstance().getClient() ? new SupabaseOfferRepository() : new MockOfferRepository());

export { SupabaseOfferRepository, MockOfferRepository };
