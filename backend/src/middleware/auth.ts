import type { Request, Response, NextFunction } from "express";
import AgentRepository from "@/repositories/AgentRepository";

/**
 * Required auth middleware - blocks requests without valid auth
 * Use for: POST, PUT, PATCH, DELETE operations (write operations)
 */
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

/**
 * Optional auth middleware - allows public access but attaches agent if token provided
 * Use for: GET operations (read operations)
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    const apiKey = authHeader.split(" ")[1];

    if (apiKey) {
      try {
        const agent = await AgentRepository.findByApiKey(apiKey);
        if (agent) {
          req.apiKey = apiKey;
          req.agent = agent;
        }
      } catch (error) {
        console.error("Optional Auth Middleware Error:", error);
        // Continue without auth - don't block the request
      }
    }
  }

  next();
};
