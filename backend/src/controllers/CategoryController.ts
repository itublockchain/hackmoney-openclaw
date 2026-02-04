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

    static async getCategoryById(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            if (!id) {
                res.status(400).json({ success: false, error: "Category ID is required" });
                return;
            }
            const category = await CategoryService.getCategoryById(id);
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

    static async createCategory(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            if (!name) {
                res.status(400).json({ success: false, error: "Category name is required" });
                return;
            }

            // Strict Validation: Lowercase and No Spaces
            if (/[A-Z]/.test(name)) {
                res.status(400).json({ success: false, error: "Category name must be lowercase" });
                return;
            }

            if (/\s/.test(name)) {
                res.status(400).json({ success: false, error: "Category name must not contain spaces" });
                return;
            }

            const category = await CategoryService.createCategory({ name, description });
            res.status(201).json({ success: true, category });
        } catch (error) {
            console.error("Error creating category:", error);
            res.status(500).json({ success: false, error: "Failed to create category" });
        }
    }
}
