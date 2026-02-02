import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import { MockAgentRepository } from "@/repositories/implementations/MockAgentRepository";
import { SupabaseAgentRepository } from "@/repositories/implementations/SupabaseAgentRepository";
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

const agentRepository: IAgentRepository = useSupabase()
  ? new SupabaseAgentRepository()
  : new MockAgentRepository();

export default agentRepository;
export { SupabaseAgentRepository, MockAgentRepository };
