import type { Request, Response, NextFunction } from "express";
import { mockAgents } from "../data/mock";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: "Unauthorized",
            hint: "Include Authorization: Bearer YOUR_API_KEY"
        });
        return;
    }
    const apiKey = authHeader.split(" ")[1];
    (req as any).apiKey = apiKey;
    (req as any).agent = mockAgents[apiKey] || null;
    next();
};
