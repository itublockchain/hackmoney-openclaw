import type { ICategoryRepository } from "@/repositories/interfaces/ICategoryRepository";
import { MockCategoryRepository } from "./implementations/MockCategoryRepository";
import { SupabaseCategoryRepository } from "./implementations/SupabaseCategoryRepository";
import SupabaseService from "@/lib/supabase";

const isProd = process.env.NODE_ENV === "production";

const categoryRepository: ICategoryRepository = isProd
    ? new SupabaseCategoryRepository()
    : (SupabaseService.getInstance().getClient() ? new SupabaseCategoryRepository() : new MockCategoryRepository());

export default categoryRepository;
