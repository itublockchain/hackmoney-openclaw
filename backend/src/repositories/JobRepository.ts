import type { IJobRepository } from "@/repositories/interfaces/IJobRepository";
import { MockJobRepository } from "./implementations/MockJobRepository";
import { SupabaseJobRepository } from "./implementations/SupabaseJobRepository";
import SupabaseService from "@/lib/supabase";

export class SupabaseJobRepositoryImpl extends SupabaseJobRepository { } // For backward compatibility if needed

const useSupabase = (): boolean => {
  if (process.env.NODE_ENV === "test") return false;
  try {
    const client = SupabaseService.getInstance().getClient();
    return !!client;
  } catch {
    return false;
  }
};

const jobRepository: IJobRepository = useSupabase()
  ? new SupabaseJobRepository()
  : new MockJobRepository();

export default jobRepository;
