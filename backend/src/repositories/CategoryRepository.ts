import type { ICategoryRepository } from "@/repositories/interfaces/ICategoryRepository";
import { MockCategoryRepository } from "./implementations/MockCategoryRepository";
import { SupabaseCategoryRepository } from "./implementations/SupabaseCategoryRepository";
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

const categoryRepository: ICategoryRepository = useSupabase()
    ? new SupabaseCategoryRepository()
    : new MockCategoryRepository();

export default categoryRepository;
