import type { Request, Response } from "express";
import SubmoltService from "@/services/SubmoltService";

export default class SubmoltController {
    static async getAllSubmolts(_req: Request, res: Response) {
        try {
            const submolts = await SubmoltService.getAllSubmolts();
            res.json({ success: true, submolts });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to fetch submolts" });
        }
    }

    static async createSubmolt(req: Request, res: Response) {
        try {
            const { name, display_name, description } = req.body;

            if (!name || !display_name) {
                res
                    .status(400)
                    .json({
                        success: false,
                        error: "name and display_name are required",
                    });
                return;
            }

            const newSubmolt = await SubmoltService.createSubmolt({
                name,
                display_name,
                description,
            });
            res.json({ success: true, submolt: newSubmolt });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to create submolt" });
        }
    }

    static async getSubmoltByName(req: Request, res: Response) {
        try {
            const { name } = req.params;
            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            const submolt = await SubmoltService.getSubmoltByName(name);
            if (!submolt) {
                res.status(404).json({ success: false, error: "Submolt not found" });
                return;
            }
            res.json({ success: true, submolt, your_role: null });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to fetch submolt" });
        }
    }

    static async getSubmoltFeed(req: Request, res: Response) {
        try {
            const { name } = req.params;
            const { sort } = req.query;

            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            const posts = await SubmoltService.getSubmoltFeed(name, sort as any);
            res.json({ success: true, posts });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch feed" });
        }
    }

    static async subscribe(req: Request, res: Response) {
        try {
            const { name } = req.params;
            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            const agentName = req.agent?.name || "Unknown";
            const result = await SubmoltService.subscribe(name, agentName);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to subscribe" });
        }
    }

    static async unsubscribe(req: Request, res: Response) {
        try {
            const { name } = req.params;
            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            const agentName = req.agent?.name || "Unknown";
            const result = await SubmoltService.unsubscribe(name, agentName);
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to unsubscribe" });
        }
    }

    static async updateSettings(req: Request, res: Response) {
        try {
            const { name } = req.params;
            const { description, banner_color, theme_color } = req.body;

            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            const result = await SubmoltService.updateSettings(name, {
                description,
                banner_color,
                theme_color,
            });
            res.json(result);
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to update settings" });
        }
    }

    static async uploadAsset(req: Request, res: Response) {
        try {
            const { name } = req.params;
            const assetType = (req.body.type || req.query.type) as
                | "avatar"
                | "banner";

            if (!name || typeof name !== "string") {
                res.status(400).json({ success: false, error: "Invalid submolt name" });
                return;
            }

            if (!req.file) {
                res.status(400).json({ success: false, error: "No file provided" });
                return;
            }

            if (!assetType || !["avatar", "banner"].includes(assetType)) {
                res
                    .status(400)
                    .json({ success: false, error: "type must be 'avatar' or 'banner'" });
                return;
            }

            const result = await SubmoltService.uploadAsset(
                name,
                assetType,
                req.file.path,
            );
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to upload asset" });
        }
    }

    static async getModerators(_req: Request, res: Response) {
        // Placeholder as per original code
        res.json({ success: true, moderators: [] });
    }

    static async addModerator(_req: Request, res: Response) {
        // Placeholder as per original code
        res.json({ success: true, message: "Moderator added" });
    }

    static async removeModerator(_req: Request, res: Response) {
        // Placeholder as per original code
        res.json({ success: true, message: "Moderator removed" });
    }
}
