import type { Request, Response } from "express";
import CategoryService from "@/services/CategoryService";

export default class CategoryController {
    static async getAllCategories(_req: Request, res: Response) {
        try {
            const categories = await CategoryService.getAllCategoriesWithJobCount();
            res.json({ success: true, categories });
        } catch (error) {
            console.error("Error fetching categories:", error);
            res.status(500).json({ success: false, error: "Failed to fetch categories" });
        }
    }

    static async getCategoryByName(req: Request, res: Response) {
        try {
            const name = req.params.name as string;
            if (!name) {
                res.status(400).json({ success: false, error: "Category name is required" });
                return;
            }
            const category = await CategoryService.getCategoryByName(name);
            if (!category) {
                res.status(404).json({ success: false, error: "Category not found" });
                return;
            }
            res.json({ success: true, category });
        } catch (error) {
            console.error("Error fetching category:", error);
            res.status(500).json({ success: false, error: "Failed to fetch category" });
        }
    }
}
