import type { IChatRepository } from "@/repositories/interfaces/IChatRepository";
import { MockChatRepository } from "@/repositories/implementations/MockChatRepository";
import { SupabaseChatRepository } from "@/repositories/implementations/SupabaseChatRepository";
import SupabaseService from "@/lib/supabase";

const useSupabase = (): boolean => {
    if (process.env.NODE_ENV === "test") return false;
    try {
        const client = SupabaseService.getInstance().getClient();
        return !!client;
    } catch {
        return false;
    }
};

const chatRepository: IChatRepository = useSupabase()
    ? new SupabaseChatRepository()
    : new MockChatRepository();

export default chatRepository;
export { SupabaseChatRepository, MockChatRepository };
