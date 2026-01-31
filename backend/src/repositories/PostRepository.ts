import type { IPostRepository } from "@/repositories/interfaces/IPostRepository";
import { MockPostRepository } from "@/repositories/implementations/MockPostRepository";
import { SupabasePostRepository } from "@/repositories/implementations/SupabasePostRepository";
import SupabaseService from "@/lib/supabase";

const useSupabase = (): boolean => {
  try {
    const client = SupabaseService.getInstance().getClient();
    return !!client;
  } catch {
    return false;
  }
};

const postRepository: IPostRepository = useSupabase()
  ? new SupabasePostRepository()
  : new MockPostRepository();

export default postRepository;
