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
            const { username, name, title, description, wallet_address, erc8004_id, metadata, message, signature, challenge } = req.body;

            let finalWalletAddress = wallet_address;

            // 1. SIWE Verification (Optional but preferred for security)
            if (message && signature && challenge) {
                try {
                    const decoded = jwt.verify(challenge, config.JWT_SECRET) as any;
                    if (decoded.type !== "challenge") {
                        res.status(400).json({ success: false, error: "Invalid challenge token" });
                        return;
                    }

                    const siweMessage = typeof message === 'string' ? new SiweMessage(message) : new SiweMessage(message as any);
                    await siweMessage.verify({ signature });

                    if (siweMessage.nonce !== decoded.nonce) {
                        res.status(400).json({ success: false, error: "Verification failed: nonce mismatch" });
                        return;
                    }

                    finalWalletAddress = siweMessage.address.toLowerCase();
                    console.log(`✅ Securely recovered wallet address: ${finalWalletAddress}`);
                } catch (err: any) {
                    console.error("SIWE Verification failed during registration:", err);
                    res.status(400).json({ success: false, error: "Signature verification failed: " + err.message });
                    return;
                }
            }

            const finalUsername = username || name;

            if (!finalUsername) {
                res.status(400).json({ success: false, error: "Username or Name is required" });
                return;
            }

            if (!finalWalletAddress) {
                res.status(400).json({ success: false, error: "Wallet address is required for registration" });
                return;
            }


            const agent = await AgentService.registerAgent({
                username: finalUsername,
                title,
                description,
                wallet_address: finalWalletAddress,
                erc8004_id,
                metadata: metadata || {}
            });

            // Calculate full ERC8004 metadata and persist it as the main metadata object
            const fullMetadata = AgentService.generateAgentMetadata(agent);
            const updatedAgent = await AgentService.updateAgent(agent.id, {
                metadata: fullMetadata
            });

            const finalAgent = updatedAgent || agent;

            let token: string | undefined;
            if (finalAgent.erc8004_id) {
                token = jwt.sign(
                    {
                        agentId: finalAgent.id,
                        username: finalAgent.username,
                        type: "auth",
                    },
                    config.JWT_SECRET,
                    { expiresIn: "7d" },
                );
            }

            res.status(201).json({
                success: true,
                agent: {
                    ...finalAgent,
                    name: finalAgent.username
                },
                token,
                metadata_url: `${config.APP_URL}/api/v1/agents/${finalAgent.id}/metadata`,
                api_key: finalAgent.id
            });
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

        const siweMessage = new SiweMessage({
            domain: new URL(config.APP_URL).hostname,
            address: address,
            statement: `Login to ${config.APP_NAME}`,
            uri: config.APP_URL,
            version: '1',
            chainId: config.CHAIN_ID,
            nonce: nonce,
        });

        const message = siweMessage.prepareMessage();

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
            message,
        });
    }

    static async login(req: Request, res: Response) {
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

            // Parse message to get address
            let address: string;
            try {
                const siweMessage = typeof message === 'string' ? new SiweMessage(message) : new SiweMessage(message as any);
                address = siweMessage.address;
            } catch (e) {
                res.status(400).json({ success: false, error: "Invalid SIWE message format" });
                return;
            }

            // 1. Strict On-Chain Gate (Check before signature to provide 403)
            const agents = await AgentService.getAllAgents();
            const agent = agents.find(a => a.wallet_address?.toLowerCase() === address.toLowerCase());

            if (!agent || !agent.erc8004_id) {
                res.status(403).json({
                    success: false,
                    error: "Authentication restricted to on-chain registered agents",
                    hint: "Please register your agent on-chain first."
                });
                return;
            }

            // 2. Signature Verification
            const siweMessage = typeof message === 'string' ? new SiweMessage(message) : new SiweMessage(message as any);
            await siweMessage.verify({ signature });

            if (siweMessage.nonce !== decoded.nonce || siweMessage.address.toLowerCase() !== decoded.address.toLowerCase()) {
                res.status(400).json({ success: false, error: "Verification failed: mismatch" });
                return;
            }

            const authToken = jwt.sign(
                {
                    agentId: agent.id,
                    username: agent.username,
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
                agentId: agent.id
            });
        } catch (error) {
            console.error("Login verification error:", error);
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

            // 3. Extract numeric ID for the database
            const numericId = parseInt(BlockchainAgentService.parseNumericId(result.agentId));

            // 4. Generate full ERC8004 metadata including new blockchain data
            const agentWithBlockchainData = {
                ...agent,
                erc8004_id: numericId,
                metadata: {
                    ...agent.metadata,
                    blockchainId: result.agentId,
                    onChainTx: result.txHash,
                    metadataUrl: result.metadataUrl
                }
            };
            const fullMetadata = AgentService.generateAgentMetadata(agentWithBlockchainData as any);

            // 5. Update agent with full blockchain info and persisted metadata
            await AgentService.updateAgent(agent.id, {
                erc8004_id: numericId,
                metadata: {
                    ...fullMetadata,
                    blockchainId: result.agentId,
                    onChainTx: result.txHash,
                    metadataUrl: result.metadataUrl
                }
            });

            const token = jwt.sign(
                {
                    agentId: agent.id,
                    username: agent.username,
                    type: "auth",
                },
                config.JWT_SECRET,
                { expiresIn: "7d" },
            );

            res.json({
                success: true,
                ...result,
                token,
                metadata_url: result.metadataUrl
            });
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

            // Return persisted metadata if it exists, otherwise generate on the fly
            const metadata = (Object.keys(agent.metadata || {}).length > 3) ? agent.metadata : AgentService.generateAgentMetadata(agent);

            res.json(metadata);
        } catch (error) {
            console.error("Error fetching agent metadata:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent metadata" });
        }
    }

    static async getAgentX402(req: Request, res: Response) {
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

            // Return agent's interaction endpoint info
            res.json({
                success: true,
                agent_id: agent.id,
                name: agent.username,
                x402_service: {
                    status: "active",
                    capabilities: [
                        "autonomous-negotiation",
                        "structured-data-exchange",
                        "secure-payment-verification"
                    ],
                    endpoints: {
                        chat: `${config.APP_URL}/api/v1/chat`,
                        offers: `${config.APP_URL}/api/v1/offers`
                    }
                }
            });
        } catch (error) {
            console.error("Error fetching agent X402 data:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent X402 data" });
        }
    }
}
