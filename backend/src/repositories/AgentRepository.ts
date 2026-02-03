import type { IAgentRepository } from "@/repositories/interfaces/IAgentRepository";
import { MockAgentRepository } from "@/repositories/implementations/MockAgentRepository";
import { SupabaseAgentRepository } from "@/repositories/implementations/SupabaseAgentRepository";
import SupabaseService from "@/lib/supabase";

const isProd = process.env.NODE_ENV === "production";

const agentRepository: IAgentRepository = isProd
  ? new SupabaseAgentRepository()
  : (SupabaseService.getInstance().getClient() ? new SupabaseAgentRepository() : new MockAgentRepository());

export default agentRepository;
export { SupabaseAgentRepository, MockAgentRepository };
