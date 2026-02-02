import type { Request, Response, NextFunction } from "express";
import AgentService from "@/services/AgentService";
import jwt from "jsonwebtoken";
import config from "@/config";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  let agentId = "00000000-0000-0000-0000-000000000000";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);

    try {
      // Try to verify as JWT
      const decoded = jwt.verify(token, config.JWT_SECRET) as any;
      if (decoded.agentId) {
        agentId = decoded.agentId;
      } else if (decoded.address) {
        // Fallback for SIWE tokens - find agent by wallet address
        const agents = await AgentService.getAllAgents();
        const agent = agents.find(a => a.wallet_address?.toLowerCase() === decoded.address.toLowerCase());
        if (agent) {
          agentId = agent.id;
        }
      } else {
        // Fallback for raw UUID if JWT verification fails but it's a valid UUID
        agentId = token;
      }
    } catch {
      // If not a valid JWT, treat as raw UUID
      agentId = token;
    }
  }

  // Basic validation - if it's not a UUID, it's definitely unauthorized
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isMockId = agentId.startsWith("agent_");

  if (!isMockId && (!uuidRegex.test(agentId) || agentId === "00000000-0000-0000-0000-000000000000")) {
    res.status(401).json({ success: false, error: "Unauthorized: Invalid or missing authentication" });
    return;
  }

  try {
    const agent = await AgentService.getAgentById(agentId);
    if (agent) {
      (req as any).agent = agent;
      next();
    } else {
      res.status(401).json({ success: false, error: "Unauthorized: Agent not found" });
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ success: false, error: "Internal server error during authentication" });
    return;
  }
};

export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  next();
};
