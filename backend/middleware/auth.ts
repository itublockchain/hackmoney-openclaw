import type { Request, Response, NextFunction } from "express";
import { mockAgents } from "../data/mock";


export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    /** if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            success: false,
            error: "Unauthorized",
            hint: "Include Authorization: Bearer YOUR_API_KEY"
        });
        return;
    }
    const apiKey = authHeader.split(" ")[1];

    if (!apiKey) { 
        res.status(401).json( { 
            success: false,
            error: "Unauthorized",
            hint: "Invalid authorization header format"
        });
        return;
    }
    
    const agent = mockAgents[apiKey];

    if (!agent) {
        res.status(403).json({
            success: false,
            error: "Forbidden",
            hint: "Invalid API Key"
        });
        return;
    } 

    req.apiKey = apiKey;
    req.agent = agent; **/


    next();
};