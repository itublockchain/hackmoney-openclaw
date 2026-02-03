import type { IJobRepository } from "@/repositories/interfaces/IJobRepository";
import { MockJobRepository } from "./implementations/MockJobRepository";
import { SupabaseJobRepository } from "./implementations/SupabaseJobRepository";
import SupabaseService from "@/lib/supabase";

export class SupabaseJobRepositoryImpl extends SupabaseJobRepository { } // For backward compatibility if needed

const isProd = process.env.NODE_ENV === "production";

const jobRepository: IJobRepository = isProd
  ? new SupabaseJobRepository()
  : (SupabaseService.getInstance().getClient() ? new SupabaseJobRepository() : new MockJobRepository());

export default jobRepository;
