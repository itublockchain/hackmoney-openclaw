import type { Request, Response } from "express";
import AgentService from "@/services/AgentService";
import X402Service from "@/services/X402Service";
import jwt from "jsonwebtoken";
import config from "@/config";
import { SiweMessage } from "siwe";
import { supabase } from "@/lib/supabase";

import { sepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { ethers } from "ethers";

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
            const { username, name, title, description, wallet_address } = req.body;

            let finalWalletAddress = wallet_address;

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
                erc8004_id: undefined,
                metadata: {}
            });

            // Calculate full ERC8004 metadata and persist it as the main metadata object
            const fullMetadata = AgentService.generateAgentMetadata(agent);
            const updatedAgent = await AgentService.updateAgent(agent.id, {
                metadata: fullMetadata
            });



            const finalAgent = updatedAgent || agent;

            res.status(201).json({
                success: true,
                agent: {
                    ...finalAgent,
                    username: finalAgent.username
                },
                metadata_url: `${config.APP_URL}/api/v1/agents/${finalAgent.id}/metadata`,
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

            // Generate the X402 Discovery Header
            const header = X402Service.generatePaymentHeader({
                amount: "0", // Default discovery amount
                resource: `agent:${agent.id}`,
                description: `Interaction with agent: ${agent.username}`
            });

            res.set("PAYMENT-REQUIRED", header);
            res.status(402).json({
                success: false,
                error: "Payment Required",
                wallet_address: agent.wallet_address,
                message: "Sign deposit(worker) tx and send signed RLP in POST /agents/:id/x402."
            });
        } catch (error) {
            console.error("Error fetching agent X402 data:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent X402 data" });
        }
    }

    static async handleX402Request(req: Request, res: Response) {
        try {
            const client = createPublicClient({
                chain: sepolia,
                transport: http(config.RPC_URL),
            });

            const { signature, resource } = req.body;

            if (!signature || !resource) {
                res.status(400).json({ success: false, error: "Missing signature or resource" });
                return;
            }

            // 1. Broadcast the transaction
            let txHash: `0x${string}`;
            try {
                txHash = await X402Service.broadcastTransaction(signature);
            } catch (error: any) {
                console.error("X402 Payment broadcast failed:", error.message);
                res.status(error.status || 500).json({
                    success: false,
                    error: error.message || "Payment processing failed",
                    txHash: error.txHash,
                    reason: error.reason
                });
                return;
            }

            // 2. Update job status to 'submitted' if resource is a job
            if (resource.startsWith("job:")) {
                const jobId = resource.split(":")[1];
                try {
                    const { error: dbError } = await supabase()
                        .from("jobs")
                        .update({ status: "submitted" })
                        .eq("id", jobId);

                    if (dbError) throw dbError;
                } catch (dbError) {
                    console.error("Error updating job status after payment:", dbError);
                }
            }

            const receipt = await client.waitForTransactionReceipt({
                hash: txHash,
            });

            console.log("Transaction receipt:", receipt);

            if (receipt.status !== "success") {
                res.status(500).json({
                    success: false,
                    error: "Payment transaction failed",
                    txHash: txHash
                });
                return;

            }

            console.log("Deposit confirmed on chain");

            res.json({
                success: true,
                data: {
                    result: "Payment successful",
                    resource: resource,
                    escrowTx: txHash
                }
            });
        } catch (error) {
            console.error("AgentController.handleX402Request error:", error);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    /**
     * Broadcasts a signed transaction to the blockchain.
     * Acts as a facilitator for X402 payments.
     */
    static async broadcast(req: Request, res: Response) {
        try {
            const { signedTx } = req.body;

            if (!signedTx) {
                res.status(400).json({ success: false, error: "Missing signedTx" });
                return;
            }

            // Validate that it is a valid signed transaction
            try {
                const tx = ethers.Transaction.from(signedTx);
                if (!tx.hash) {
                    throw new Error("Invalid transaction structure");
                }
            } catch (e) {
                console.error("Invalid signed transaction:", e);
                res.status(400).json({ success: false, error: "Invalid signed transaction format" });
                return;
            }

            console.log(" Facilitator: Broadcasting transaction...");

            if (!config.RPC_URL) {
                throw new Error("RPC_URL not configured");
            }
            const provider = new ethers.JsonRpcProvider(config.RPC_URL);

            // Send the raw transaction
            const txResponse = await provider.broadcastTransaction(signedTx);
            console.log(`Facilitator: Tx broadcasted: ${txResponse.hash}`);

            res.json({
                success: true,
                txHash: txResponse.hash
            });

        } catch (error: any) {
            console.error("❌ Facilitator Broadcast Error:", error);

            res.status(500).json({
                success: false,
                error: "Broadcast failed",
                reason: error.message
            });
        }
    }
}
