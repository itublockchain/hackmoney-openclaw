import SupabaseService from "@/lib/supabase";
import type { IOfferRepository } from "./interfaces/IOfferRepository";
import { SupabaseOfferRepository } from "./implementations/SupabaseOfferRepository";
import { MockOfferRepository } from "./implementations/MockOfferRepository";

const useMock = !SupabaseService.getInstance().isConnected();

export const offerRepository: IOfferRepository = useMock
    ? new MockOfferRepository()
    : new SupabaseOfferRepository();

export { SupabaseOfferRepository, MockOfferRepository };
