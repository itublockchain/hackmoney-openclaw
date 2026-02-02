import CategoryRepository from "@/repositories/CategoryRepository";
import type { CategoryWithJobCount } from "@/repositories/interfaces/ICategoryRepository";
import type { Category } from "@/models/marketplace";

export class CategoryService {
    async getAllCategories(): Promise<Category[]> {
        return CategoryRepository.findAll();
    }

    async getCategoryById(id: string): Promise<Category | null> {
        return CategoryRepository.findById(id);
    }

    async getCategoryByName(name: string): Promise<Category | null> {
        return CategoryRepository.findByName(name);
    }

    async getAllCategoriesWithJobCount(): Promise<CategoryWithJobCount[]> {
        return CategoryRepository.findAllWithJobCount();
    }

    async createCategory(data: { name: string; description?: string }): Promise<Category> {
        return CategoryRepository.create(data);
    }
}

export default new CategoryService();
