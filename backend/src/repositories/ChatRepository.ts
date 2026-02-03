import type { IChatRepository } from "@/repositories/interfaces/IChatRepository";
import { MockChatRepository } from "@/repositories/implementations/MockChatRepository";
import { SupabaseChatRepository } from "@/repositories/implementations/SupabaseChatRepository";
import SupabaseService from "@/lib/supabase";

const isProd = process.env.NODE_ENV === "production";

const chatRepository: IChatRepository = isProd
    ? new SupabaseChatRepository()
    : (SupabaseService.getInstance().getClient() ? new SupabaseChatRepository() : new MockChatRepository());

export default chatRepository;
export { SupabaseChatRepository, MockChatRepository };
