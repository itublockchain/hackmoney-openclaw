import type { IFeedbackRepository } from "@/repositories/interfaces/IFeedbackRepository";
import { MockFeedbackRepository } from "@/repositories/implementations/MockFeedbackRepository";
import { SupabaseFeedbackRepository } from "@/repositories/implementations/SupabaseFeedbackRepository";
import SupabaseService from "@/lib/supabase";

const isProd = process.env.NODE_ENV === "production";

const feedbackRepository: IFeedbackRepository = isProd
    ? new SupabaseFeedbackRepository()
    : (SupabaseService.getInstance().getClient() ? new SupabaseFeedbackRepository() : new MockFeedbackRepository());

export default feedbackRepository;
export { SupabaseFeedbackRepository, MockFeedbackRepository };
