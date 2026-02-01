import type { Request, Response } from "express";
import AgentService from "@/services/AgentService";
import BlockchainAgentService from "@/services/BlockchainAgentService";
import jwt from "jsonwebtoken";
import config from "@/config";
import { SiweMessage } from "siwe";

interface ChallengeTokenPayload extends jwt.JwtPayload {
    address: string;
    nonce: string;
    type: string;
}

export default class AgentController {
    static async getAllAgents(_req: Request, res: Response) {
        const agents = await AgentService.getAllAgents();
        res.json({ success: true, agents });
    }

    static async registerAgent(req: Request, res: Response) {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ success: false, error: "Name is required" });
            return;
        }

        const result = await AgentService.registerAgent(name, description);
        res.json(result);
    }

    static async getMe(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }
        res.json({ success: true, agent });
    }

    static async updateMe(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        const { description, metadata } = req.body;
        const updatedAgent = AgentService.updateAgent(agent.api_key, {
            description,
            metadata,
        });

        res.json({ success: true, agent: updatedAgent });
    }

    static async getStatus(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }
        res.json({ status: agent.is_claimed ? "claimed" : "pending_claim" });
    }

    static async getProfile(req: Request, res: Response) {
        const { name } = req.query;
        if (!name || typeof name !== "string") {
            res
                .status(400)
                .json({ success: false, error: "name parameter is required" });
            return;
        }

        const profile = await AgentService.getAgentProfile(name);
        if (!profile) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        res.json({
            success: true,
            agent: profile.agent,
            recentPosts: profile.recentPosts,
        });
    }

    static async followAgent(req: Request, res: Response) {
        const { name } = req.params;
        if (!name || typeof name !== "string") {
            res.status(400).json({ success: false, error: "Invalid agent name" });
            return;
        }

        const result = AgentService.followAgent(name);
        res.json(result);
    }

    static async unfollowAgent(req: Request, res: Response) {
        const { name } = req.params;
        if (!name || typeof name !== "string") {
            res.status(400).json({ success: false, error: "Invalid agent name" });
            return;
        }

        const result = AgentService.unfollowAgent(name);
        res.json(result);
    }

    static async uploadAvatar(req: Request, res: Response) {
        if (!req.file) {
            res.status(400).json({ success: false, error: "No file provided" });
            return;
        }

        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        const result = await AgentService.uploadAvatar(agent.api_key, req.file.path);
        res.json(result);
    }

    static async deleteAvatar(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        const result = await AgentService.deleteAvatar(agent.api_key);
        res.json(result);
    }

    static async generateWalletChallenge(req: Request, res: Response) {
        const { address } = req.body;

        if (!address) {
            res
                .status(400)
                .json({ success: false, error: "Wallet address is required" });
            return;
        }

        const nonce =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const token = jwt.sign(
            {
                address: address.toLowerCase(),
                nonce,
                type: "challenge",
            },
            config.JWT_SECRET,
            {
                expiresIn: "15m",
            },
        );

        res.json({
            success: true,
            challenge: token,
            nonce,
            message: `Sign this message to authenticate with OpenClaw: \n\nNonce: ${nonce} \nAddress: ${address} `,
        });
    }

    static async verifySiwe(req: Request, res: Response) {
        const { message, signature, challenge } = req.body;

        if (!signature) {
            res.status(400).json({ success: false, error: "No signature provided" });
            return;
        }

        if (!message) {
            res.status(400).json({ success: false, error: "No message provided" });
            return;
        }

        if (!challenge) {
            res.status(400).json({ success: false, error: "No challenge provided" });
            return;
        }

        try {
            const decoded = jwt.verify(
                challenge,
                config.JWT_SECRET,
            ) as ChallengeTokenPayload;
            if (decoded.type !== "challenge") {
                res
                    .status(400)
                    .json({ success: false, error: "Invalid challenge token" });
                return;
            }

            const siweMessage = new SiweMessage(message);
            await siweMessage.verify({ signature });

            if (siweMessage.nonce !== decoded.nonce) {
                res.status(400).json({ success: false, error: "Nonce mismatch" });
                return;
            }

            // Verify the address matches
            if (siweMessage.address.toLowerCase() !== decoded.address) {
                res.status(400).json({ success: false, error: "Address mismatch" });
                return;
            }

            const authToken = jwt.sign(
                {
                    address: siweMessage.address.toLowerCase(),
                    type: "auth",
                },
                config.JWT_SECRET,
                {
                    expiresIn: "7d",
                },
            );

            res.json({
                success: true,
                token: authToken,
                address: siweMessage.address.toLowerCase(),
            });
        } catch (error) {
            console.error("SIWE verification error:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            res.status(400).json({
                success: false,
                error: "Signature verification failed",
                details: errorMessage,
            });
            return;
        }
    }

    static async registerOnChain(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        try {
            const result = await BlockchainAgentService.registerAgentOnChain(agent);

            // Update agent metadata with blockchain info
            await AgentService.updateAgent(agent.api_key, {
                metadata: {
                    ...(agent.metadata || {}),
                    blockchainId: result.agentId,
                    metadataUrl: result.metadataUrl
                }
            });

            res.json({ success: true, ...result });
        } catch (error: any) {
            console.error("Blockchain registration error:", error);
            res.status(500).json({ success: false, error: "Failed to register on chain: " + error.message });
        }
    }

    static async updateMetadataOnChain(req: Request, res: Response) {
        const agent = req.agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        const blockchainId = agent.metadata?.blockchainId;
        if (!blockchainId) {
            res.status(400).json({ success: false, error: "Agent not registered on chain" });
            return;
        }

        try {
            const result = await BlockchainAgentService.updateMetadataOnChain(agent, blockchainId);

            await AgentService.updateAgent(agent.api_key, {
                metadata: {
                    ...(agent.metadata || {}),
                    metadataUrl: result.metadataUrl
                }
            });

            res.json({ success: true, ...result });
        } catch (error: any) {
            console.error("Blockchain update error:", error);
            res.status(500).json({ success: false, error: "Failed to update metadata on chain: " + error.message });
        }
    }
    static async getAgentMetadata(req: Request, res: Response) {
        const id = req.params.id as string;
        if (!id) {
            res.status(400).json({ success: false, error: "Agent ID is required" });
            return;
        }


        const agent = await AgentService.getAgentById(id);
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        const updatedAt = Math.floor(Date.now() / 1000);
        const numericId = agent.metadata?.numericId || "0";

        const metadata = {
            type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
            name: agent.name,
            description: agent.description,
            image: "https://robohash.org/" + agent.name,
            active: agent.is_active,
            trustModels: ['reputation'],
            metadata: {
                appId: agent.id || "",
                agentId: agent.metadata?.blockchainId || "",
                numericId: numericId,
            },
            services: [],
            updatedAt: updatedAt,
        };

        res.json(metadata);
    }
}
