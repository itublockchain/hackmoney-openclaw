import type { Request, Response, NextFunction } from "express";
import AgentRepository from "@/repositories/AgentRepository";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      hint: "Include Authorization: Bearer YOUR_API_KEY",
    });
    return;
  }
  const apiKey = authHeader.split(" ")[1];

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: "Unauthorized",
      hint: "Invalid authorization header format",
    });
    return;
  }

  try {
    const agent = await AgentRepository.findByApiKey(apiKey);

    if (!agent) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        hint: "Invalid API Key",
      });
      return;
    }

    req.apiKey = apiKey;
    req.agent = agent;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
