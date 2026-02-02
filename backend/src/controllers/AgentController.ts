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
        try {
            const agents = await AgentService.getAllAgents();
            res.json({ success: true, agents });
        } catch (error) {
            console.error("Error fetching agents:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agents" });
        }
    }

    static async getAgentById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: "Agent ID is required" });
                return;
            }
            const agent = await AgentService.getAgentById(id as string);
            if (!agent) {
                res.status(404).json({ success: false, error: "Agent not found" });
                return;
            }
            res.json({ success: true, agent });
        } catch (error) {
            console.error("Error fetching agent:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent" });
        }
    }

    static async getAgentByUsername(req: Request, res: Response) {
        try {
            const { username } = req.params;
            if (!username) {
                res.status(400).json({ success: false, error: "Username is required" });
                return;
            }
            const agent = await AgentService.getAgentByUsername(username as string);
            if (!agent) {
                res.status(404).json({ success: false, error: "Agent not found" });
                return;
            }
            res.json({ success: true, agent });
        } catch (error) {
            console.error("Error fetching agent:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent" });
        }
    }

    static async registerAgent(req: Request, res: Response) {
        try {
            const { username, name, title, description, wallet_address, erc8004_address, metadata } = req.body;

            const finalUsername = username || name;

            if (!finalUsername) {
                res.status(400).json({ success: false, error: "Username or Name is required" });
                return;
            }


            const agent = await AgentService.registerAgent({
                username: finalUsername,
                title,
                description,
                wallet_address,
                erc8004_address,
                metadata: metadata || {}
            });

            res.status(201).json({ success: true, agent: { ...agent, name: agent.username }, api_key: agent.id });
        } catch (error) {
            console.error("Error registering agent:", error);
            res.status(500).json({ success: false, error: "Failed to register agent" });
        }
    }

    static async getMe(req: Request, res: Response) {
        const agent = (req as any).agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }
        res.json({ success: true, agent: { ...agent, name: agent.username || agent.title } });
    }

    static async updateMe(req: Request, res: Response) {
        const agent = (req as any).agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        try {
            const updates = req.body;
            const updatedAgent = await AgentService.updateAgent(agent.id, updates);
            res.json({ success: true, agent: updatedAgent });
        } catch (error) {
            console.error("Error updating agent:", error);
            res.status(500).json({ success: false, error: "Failed to update agent" });
        }
    }

    static async generateWalletChallenge(req: Request, res: Response) {
        const { address } = req.body;

        if (!address) {
            res.status(400).json({ success: false, error: "Wallet address is required" });
            return;
        }

        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

        const token = jwt.sign(
            {
                address: address.toLowerCase(),
                nonce,
                type: "challenge",
            },
            config.JWT_SECRET,
            { expiresIn: "15m" },
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

        if (!signature || !message || !challenge) {
            res.status(400).json({ success: false, error: "Missing required verification data" });
            return;
        }

        try {
            const decoded = jwt.verify(challenge, config.JWT_SECRET) as ChallengeTokenPayload;
            if (decoded.type !== "challenge") {
                res.status(400).json({ success: false, error: "Invalid challenge token" });
                return;
            }

            const siweMessage = new SiweMessage(message as string);
            await siweMessage.verify({ signature });

            if (siweMessage.nonce !== decoded.nonce || siweMessage.address.toLowerCase() !== decoded.address.toLowerCase()) {
                res.status(400).json({ success: false, error: "Verification failed: mismatch" });
                return;
            }

            const authToken = jwt.sign(
                {
                    address: siweMessage.address.toLowerCase(),
                    type: "auth",
                },
                config.JWT_SECRET,
                { expiresIn: "7d" },
            );

            res.json({
                success: true,
                token: authToken,
                address: siweMessage.address.toLowerCase(),
            });
        } catch (error) {
            console.error("SIWE verification error:", error);
            res.status(400).json({ success: false, error: "Signature verification failed" });
        }
    }

    static async registerOnChain(req: Request, res: Response) {
        const agent = (req as any).agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        try {
            // 2. Register on chain
            const result = await BlockchainAgentService.registerAgentOnChain(agent);

            // 3. Update agent with blockchain info
            await AgentService.updateAgent(agent.id, {
                metadata: {
                    ...agent.metadata,
                    blockchainId: result.agentId,
                    onChainTx: result.txHash,
                    metadataUrl: result.metadataUrl
                }
            });

            res.json({ success: true, ...result });
        } catch (error: any) {
            console.error("Blockchain registration error:", error);
            res.status(500).json({ success: false, error: "Failed to register on chain: " + error.message });
        }
    }

    static async getAgentMetadata(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: "Agent ID is required" });
                return;
            }
            const agent = await AgentService.getAgentById(id as string);
            if (!agent) {
                res.status(404).json({ success: false, error: "Agent not found" });
                return;
            }

            const metadata = {
                type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
                name: agent.title || agent.username,
                description: agent.description || "An autonomous AI agent on the OpenClaw network.",
                image: `https://robohash.org/${agent.title || agent.username}?set=set4`,
                active: true,
                supportedTrust: ['reputation'],
                capabilities: ["social-interaction", "job-listing", "autonomous-messaging"],
                endpoints: [
                    {
                        name: "OpenClaw Agent API",
                        endpoint: `${config.APP_URL}/api/v1/agents/${agent.id}`,
                        version: "1.0.0"
                    },
                    {
                        name: "Agent Metadata",
                        endpoint: `${config.APP_URL}/api/v1/agents/${agent.id}/metadata`,
                        version: "1.0.0"
                    }
                ],
                registrations: agent.metadata?.blockchainId ? [
                    {
                        agentId: agent.metadata.blockchainId,
                        agentRegistry: "eip155:" + config.CHAIN_ID + ":registry" // Placeholder or actual registry retrieved from SDK
                    }
                ] : [],
                metadata: {
                    appId: agent.id,
                    username: agent.username,
                    wallet: agent.wallet_address || "",
                    erc8004Address: agent.erc8004_address || ""
                },
                updatedAt: Math.floor(Date.now() / 1000),
            };

            res.json(metadata);
        } catch (error) {
            console.error("Error fetching agent metadata:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent metadata" });
        }
    }
}
