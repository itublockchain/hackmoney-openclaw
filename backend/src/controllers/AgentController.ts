import type { Request, Response } from "express";
import AgentService from "@/services/AgentService";
import X402Service from "@/services/X402Service";
import JobService from "@/services/JobService";
import jwt from "jsonwebtoken";
import config from "@/config";
import { SiweMessage } from "siwe";

import { base } from "viem/chains";
import {
    createPublicClient,
    http,
    verifyMessage,
    keccak256,
    toBytes,
    encodeFunctionData,
    type TransactionReceipt,
    type Log,
} from "viem";
import { ethers } from "ethers";
import { relayService } from "@/services/RelayService";

interface ChallengeTokenPayload extends jwt.JwtPayload {
    address: string;
    nonce: string;
    type: string;
}

export default class AgentController {
    private static formatAgent(agent: any) {
        const { metadata, ...rest } = agent;
        const avgRep = agent.feedback_count > 0
            ? (Number(agent.reputation) / Number(agent.feedback_count))
            : 0;

        return {
            ...rest,
            average_reputation: avgRep,
            metadataURI: `${config.APP_URL}/api/v1/agents/${agent.id}/metadata`,
        };
    }

    static async getAllAgents(_req: Request, res: Response) {
        try {
            const agents = await AgentService.getAllAgents();
            res.json({
                success: true,
                agents: agents.map((agent) => AgentController.formatAgent(agent)),
            });
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
            res.json({ success: true, agent: AgentController.formatAgent(agent) });
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
            res.json({ success: true, agent: AgentController.formatAgent(agent) });
        } catch (error) {
            console.error("Error fetching agent:", error);
            res.status(500).json({ success: false, error: "Failed to fetch agent" });
        }
    }

    static async registerAgent(req: Request, res: Response) {
        try {
            const { username, name, title, description, wallet_address, authorization } = req.body;

            const finalUsername = username || name;
            const finalWalletAddress = wallet_address;

            if (!finalUsername) {
                res
                    .status(400)
                    .json({ success: false, error: "Username or Name is required" });
                return;
            }

            // ENS/DNS Compatibility check (alphanumeric and hyphens only, no underscores)
            const ensRegex = /^[a-z0-9-]+$/;
            if (!ensRegex.test(finalUsername)) {
                res.status(400).json({
                    success: false,
                    error: "Invalid username. Only lowercase alphanumeric characters and hyphens (-) are allowed for ENS compatibility."
                });
                return;
            }

            if (!finalWalletAddress) {
                res
                    .status(400)
                    .json({
                        success: false,
                        error: "Wallet address is required for registration",
                    });
                return;
            }

            // Check if agent already exists locally
            const existingAgent = await AgentService.getAgentByAddress(finalWalletAddress);
            if (existingAgent) {
                res.status(409).json({ success: false, error: "Agent with this wallet address already exists" });
                return;
            }
            const existingUsername = await AgentService.getAgentByUsername(finalUsername);
            if (existingUsername) {
                res.status(409).json({ success: false, error: "Agent with this username already exists" });
                return;
            }

            // Check L2 Availability
            const isL2Available = await AgentService.checkSubdomainAvailability(finalUsername);
            if (!isL2Available) {
                res.status(409).json({ success: false, error: `Username '${finalUsername}' is already taken on L2 Subdomain Registry` });
                return;
            }

            // 1. Create agent in DB first (without ERC8004 ID)
            const agent = await AgentService.registerAgent({
                username: finalUsername,
                title,
                description,
                wallet_address: finalWalletAddress,
                erc8004_id: undefined, // Initially undefined
                metadata: {},
            });

            // Generate full metadata immediately
            // This ensures the metadata endpoint returns valid data immediately for the Relayer/Contract
            const generatedMetadata = AgentService.generateAgentMetadata(agent);
            // Update Agent with full metadata
            const updatedAgent = await AgentService.updateAgent(agent.id, { metadata: generatedMetadata });

            // 2. Prepare for On-Chain Registration via Relayer
            let txHash: string | undefined;

            if (req.body.rawAuthHex || authorization) {
                if (!config.IDENTITY_REGISTRY_ADDRESS) {
                    res.status(500).json({ success: false, error: "Identity Registry Address not configured" });
                    return;
                }

                console.log(`Processing EIP-7702 Registration for ${finalWalletAddress}...`);

                // 2a. Encode executeRegister call for the delegate contract
                const agentURI = `${config.APP_URL}/api/v1/agents/${agent.id}/metadata`;
                const DELEGATE_ABI = [
                    {
                        "inputs": [{ "internalType": "string", "name": "agentURI", "type": "string" }],
                        "name": "executeRegister",
                        "outputs": [{ "internalType": "uint256", "name": "agentId", "type": "uint256" }],
                        "stateMutability": "nonpayable",
                        "type": "function"
                    }
                ];

                const calldata = encodeFunctionData({
                    abi: DELEGATE_ABI,
                    functionName: "executeRegister",
                    args: [agentURI]
                });

                // User requested ONLY delegation check for now. Sending empty data to trigger receive()
                // const calldata = "0x";

                try {
                    // Use the internal RelayService instead of an external fetch
                    txHash = await relayService.relayWithCast({
                        to: finalWalletAddress as `0x${string}`,
                        rawAuthHex: (req.body.rawAuthHex || (typeof authorization === 'string' ? authorization : undefined)) as string,
                        data: calldata
                    });

                    console.log(`Registration Tx Finalized: ${txHash}`);

                    if (txHash) {
                        console.log(`Auto-syncing identity for agent ${agent.id}...`);
                        const tokenId = await AgentController.fetchTokenIdFromReceipt(txHash);
                        if (tokenId !== null) {
                            await AgentService.updateAgent(agent.id, { erc8004_id: tokenId });
                            console.log(`Agent ${agent.id} synchronized with on-chain ID: ${tokenId}`);
                        } else {
                            console.warn(`Register event not found for tx ${txHash}. Manual sync might be needed.`);
                        }
                    }

                } catch (chainError: any) {
                    console.error("On-chain registration failed:", chainError);
                    res.status(502).json({
                        success: false,
                        error: "Internal registration failed",
                        details: chainError.message,
                        agent: AgentController.formatAgent(agent)
                    });
                    return;
                }
            }

            // Agent is already updated with full metadata above

            // 3. Register L2 Subdomain (ENS)
            // 3. Register L2 Subdomain (ENS)
            let subdomainTx: string | null = null;
            try {
                subdomainTx = await AgentService.registerSubdomain(updatedAgent || agent);
                if (!subdomainTx) {
                    throw new Error("Subdomain registration returned null (possibly insufficient funds or config error)");
                }
                console.log(`Subdomain assigned: ${subdomainTx}`);
            } catch (err: any) {
                console.error("Subdomain registration failed:", err);

                // CRITICAL: Rollback Agent Creation
                console.log(`Rolling back agent creation for ${agent.id}...`);
                await AgentService.deleteAgent(agent.id);

                res.status(502).json({
                    success: false,
                    error: "Failed to register L2 subdomain. Agent creation rolled back.",
                    details: err.message || "Unknown error during subdomain registration"
                });
                return;
            }




            const finalAgent = updatedAgent || agent;

            res.status(201).json({
                success: true,
                agent: AgentController.formatAgent({
                    ...finalAgent,
                    username: finalAgent.username,
                }),
                metadata_url: `${config.APP_URL}/api/v1/agents/${finalAgent.id}/metadata`,
                txHash: txHash,
                subdomainTx: subdomainTx
            });
        } catch (error: any) {
            console.error("Error registering agent:", error);
            if (error.message && error.message.includes("already exists")) {
                res.status(409).json({ success: false, error: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, error: "Failed to register agent" });
        }
    }

    static async getMe(req: Request, res: Response) {
        const agent = (req as any).agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }
        res.json({
            success: true,
            agent: AgentController.formatAgent({
                ...agent,
                name: agent.username || agent.title,
            }),
        });
    }

    static async updateMe(req: Request, res: Response) {
        const agent = (req as any).agent;
        if (!agent) {
            res.status(404).json({ success: false, error: "Agent not found" });
            return;
        }

        try {
            const { reputation, feedback_count, erc8004_id, ...allowedUpdates } = req.body;
            const updatedAgent = await AgentService.updateAgent(agent.id, allowedUpdates);
            res.json({
                success: true,
                agent: AgentController.formatAgent(updatedAgent),
            });
        } catch (error) {
            console.error("Error updating agent:", error);
            res.status(500).json({ success: false, error: "Failed to update agent" });
        }
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

        const siweMessage = new SiweMessage({
            domain: new URL(config.APP_URL).hostname,
            address: address,
            statement: `Login to ${config.APP_NAME}`,
            uri: config.APP_URL,
            version: "1",
            chainId: config.CHAIN_ID,
            nonce: nonce,
        });

        const message = siweMessage.prepareMessage();

        // Compute hash for verification if client sends only hash
        const messageHash = keccak256(toBytes(message));

        const token = jwt.sign(
            {
                address: address.toLowerCase(),
                nonce,
                msgHash: messageHash,
                type: "challenge",
            },
            config.JWT_SECRET,
            { expiresIn: "15m" }
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
            res
                .status(400)
                .json({ success: false, error: "Missing required verification data" });
            return;
        }

        try {
            const decoded = jwt.verify(
                challenge,
                config.JWT_SECRET
            ) as ChallengeTokenPayload;
            if (decoded.type !== "challenge") {
                res
                    .status(400)
                    .json({ success: false, error: "Invalid challenge token" });
                return;
            }

            // Parse message to get address
            let address: string;
            try {
                const siweMessage =
                    typeof message === "string"
                        ? new SiweMessage(message)
                        : new SiweMessage(message as any);
                address = siweMessage.address;
            } catch (e) {
                res
                    .status(400)
                    .json({ success: false, error: "Invalid SIWE message format" });
                return;
            }

            // 1. Strict On-Chain Gate (Strict L2 Subdomain Check)
            const agent = await AgentService.getAgentByAddress(address);
            const isOnChainRegistered = await AgentService.verifySubdomainOwnershipOnChain(agent.username, address);

            if (!agent || !isOnChainRegistered || agent.erc8004_id === null) {
                res.status(403).json({
                    success: false,
                    error: "Authentication restricted to on-chain registered agents",
                    hint: "Agent not found in database or on-chain. Please register first.",
                });
                return;
            }

            // 2. Signature Verification
            const verified = await AgentController.verifySignature(
                message,
                signature,
                address,
                decoded.nonce,
                decoded.address
            );

            if (!verified) {
                res
                    .status(400)
                    .json({
                        success: false,
                        error: "Signature verification failed or mismatch",
                    });
                return;
            }

            const authToken = jwt.sign(
                {
                    agentId: agent.id,
                    username: agent.username,
                    address: address.toLowerCase(),
                    type: "auth",
                },
                config.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({
                success: true,
                token: authToken,
                address: address.toLowerCase(),
                agentId: agent.id,
            });
        } catch (error) {
            console.error("Login verification error:", error);
            res
                .status(400)
                .json({ success: false, error: "Signature verification failed" });
        }
    }

    private static async verifySignature(
        message: string | Partial<SiweMessage>,
        signature: string,
        address: string,
        expectedNonce: string,
        expectedAddress: string
    ): Promise<boolean> {
        try {
            // Standard SIWE verification
            const siweMessage =
                typeof message === "string"
                    ? new SiweMessage(message)
                    : new SiweMessage(message as any);
            await siweMessage.verify({ signature });

            // Nonce and address check
            if (
                siweMessage.nonce !== expectedNonce ||
                siweMessage.address.toLowerCase() !== expectedAddress.toLowerCase()
            ) {
                return false;
            }
            return true;
        } catch (e) {
            // Hash verification fallback
            try {
                const messageHash = keccak256(toBytes(message as string));
                const valid = await verifyMessage({
                    address: address as `0x${string}`,
                    message: { raw: messageHash },
                    signature: signature as `0x${string}`,
                });

                if (valid) {
                    // Verify nonces manually
                    const siweMessage =
                        typeof message === "string"
                            ? new SiweMessage(message)
                            : new SiweMessage(message as any);
                    if (
                        siweMessage.nonce !== expectedNonce ||
                        siweMessage.address.toLowerCase() !== expectedAddress.toLowerCase()
                    ) {
                        return false;
                    }
                    return true;
                }
            } catch (hashError) {
                console.error("Hash verification failed:", hashError);
            }
        }
        return false;
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
            const metadata =
                Object.keys(agent.metadata || {}).length > 3
                    ? agent.metadata
                    : AgentService.generateAgentMetadata(agent);

            res.json(metadata);
        } catch (error) {
            console.error("Error fetching agent metadata:", error);
            res
                .status(500)
                .json({ success: false, error: "Failed to fetch agent metadata" });
        }
    }

    static async getAgentX402(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { job_id } = req.query;

            if (!id) {
                res.status(400).json({ success: false, error: "Agent ID is required" });
                return;
            }
            const agent = await AgentService.getAgentById(id as string);
            if (!agent) {
                res.status(404).json({ success: false, error: "Agent not found" });
                return;
            }

            let amount = "0";
            let resourceIdx = `agent:${agent.id}`;
            let description = `Interaction with agent: ${agent.username}`;

            // If job_id is provided, implies we are funding a job
            if (job_id && typeof job_id === "string") {
                const job = await JobService.getJobById(job_id);
                if (job) {
                    // Check if there is an accepted offer to ensure we are in a valid state to fund
                    const jobAny = job as any;

                    // We use the job's budget amount as the agreed payment amount
                    if (job.budget_amount) {
                        amount = job.budget_amount.toString();
                    }

                    // For the resource, we point to the job
                    resourceIdx = `job:${job.id}`;
                    description = `Fund job: ${job.title}`;
                }
            }

            // Generate the X402 Discovery Header
            const header = X402Service.generatePaymentHeader({
                amount: amount,
                resource: resourceIdx,
                description: description,
            });

            const paymentDetails = {
                "pay-to": config.ESCROW_CONTRACT_ADDRESS,
                "max-amount-wei": amount,
                resource: resourceIdx,
                description: description,
                scheme: "exact",
                network: "base",
                chainId: config.CHAIN_ID,
            };

            res.set("PAYMENT-REQUIRED", header);
            res.status(402).json({
                success: false,
                error: "Payment Required",
                wallet_address: agent.wallet_address,
                message: "Sign deposit(worker) tx and send signed RLP in POST /agents/:id/x402.",
                "x402-payment-required": paymentDetails,
            });
        } catch (error) {
            console.error("Error fetching agent X402 data:", error);
            res
                .status(500)
                .json({ success: false, error: "Failed to fetch agent X402 data" });
        }
    }

    static async handleX402Request(req: Request, res: Response) {
        try {
            console.log("💰 handleX402Request triggered. Body keys:", Object.keys(req.body));
            const { signature, resource } = req.body;

            if (!signature || !resource) {
                res
                    .status(400)
                    .json({ success: false, error: "Missing signature or resource" });
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
                    reason: error.reason,
                });
                return;
            }

            // 2. Confirm Transaction
            console.log(`Waiting for confirmation of tx: ${txHash}`);
            let receipt;
            try {
                receipt = await AgentController.waitForTransaction(txHash);
            } catch (waitError: any) {
                console.error("❌ waitForTransaction threw error:", waitError);
                throw new Error(`Transaction confirmation failed: ${waitError.message}`);
            }

            if (receipt.status !== "success") {
                console.error("❌ Transaction status is not success:", receipt.status);
                res.status(500).json({
                    success: false,
                    error: "Payment transaction failed on-chain",
                    txHash: txHash,
                });
                return;
            }

            console.log("✅ Deposit confirmed on chain. Receipt:", { blockNumber: receipt.blockNumber, transactionHash: receipt.transactionHash });

            // 3. Update job status if needed - ONLY after confirmation
            await AgentController.updateJobStatusAfterPayment(resource);

            res.json({
                success: true,
                data: {
                    result: "Payment successful",
                    resource: resource,
                    escrowTx: txHash,
                },
            });
        } catch (error) {
            console.error("AgentController.handleX402Request error:", error);
            res.status(500).json({ success: false, error: "Internal server error" });
        }
    }

    private static async updateJobStatusAfterPayment(resource: string) {
        if (resource.startsWith("job:")) {
            const jobId = resource.split(":")[1];
            try {
                // Fetch the current job status
                const job = await JobService.getJobById(jobId);
                if (!job) {
                    console.error(`Job ${jobId} not found during payment status update`);
                    return;
                }

                // Determine appropriate transition based on current status
                if (job.status === "agreed") {
                    // Initial funding: agreed -> funded
                    await JobService.updateJob(jobId, { status: "funded" });
                    console.log(`Job ${jobId} status updated to 'funded'`);
                } else if (job.status === "reviewing") {
                    // Release funding: reviewing -> done
                    await JobService.updateJob(jobId, { status: "done" });
                    console.log(`Job ${jobId} status updated to 'done'`);
                } else if (job.status === "funded" || job.status === "done") {
                    // Already in a paid/funded state, no action needed
                    console.log(`Job ${jobId} is already in '${job.status}' state. No transition needed.`);
                } else {
                    console.warn(`Job ${jobId} is in '${job.status}' state. Unexpected payment event.`);
                }
            } catch (dbError) {
                console.error("Error updating job status after payment:", dbError);
            }
        }
    }

    private static async waitForTransaction(
        txHash: `0x${string}`
    ): Promise<TransactionReceipt> {
        const chainId = parseInt(`${config.CHAIN_ID}`);

        // Define a custom chain to match the configured environment
        // preventing viem from throwing "Chain ID mismatch" errors
        const targetChain = {
            id: chainId,
            name: "Target Chain",
            network: "target-chain",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: {
                default: { http: [config.RPC_URL] },
                public: { http: [config.RPC_URL] },
            },
        } as const;

        const client = createPublicClient({
            chain: targetChain,
            transport: http(config.RPC_URL),
        });

        console.log(`Waiting for tx ${txHash} on chain ${chainId}...`);

        return await client.waitForTransactionReceipt({
            hash: txHash,
            timeout: 60000, // 60 seconds timeout
            retryCount: 5
        });
    }

    static async syncAgentIdentity(req: Request, res: Response) {
        try {
            const { txHash, agentId } = req.body;

            if (!txHash || !agentId) {
                res
                    .status(400)
                    .json({
                        success: false,
                        error: "Transaction hash and Agent ID are required",
                    });
                return;
            }

            const agent = await AgentService.getAgentById(agentId);
            if (!agent) {
                res.status(404).json({ success: false, error: "Agent not found" });
                return;
            }

            if (agent.erc8004_id) {
                res.json({ success: true, message: "Agent already synced", agent });
                return;
            }

            console.log(`Syncing identity for agent ${agentId} with hash ${txHash}`);

            const tokenId = await AgentController.fetchTokenIdFromReceipt(txHash);
            if (tokenId === null) {
                res
                    .status(400)
                    .json({
                        success: false,
                        error: "Register event not found or transaction failed",
                    });
                return;
            }

            // Update Agent
            const updatedAgent = await AgentService.updateAgent(agent.id, {
                erc8004_id: tokenId,
            });

            res.json({
                success: true,
                message: "Identity synced successfully",
                agent: AgentController.formatAgent(updatedAgent),
            });
        } catch (error: any) {
            console.error("Sync error:", error);
            res
                .status(500)
                .json({
                    success: false,
                    error: error.message || "Failed to sync identity",
                });
        }
    }

    private static async fetchTokenIdFromReceipt(
        txHash: string
    ): Promise<number | null> {
        const client = createPublicClient({
            chain: base,
            transport: http(config.RPC_URL),
        });

        const receipt = await client.getTransactionReceipt({
            hash: txHash as `0x${string}`,
        });

        if (receipt.status !== "success") return null;

        // AgentCreated(uint256) topic
        const AGENT_CREATED_TOPIC = "0xf8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7";
        const log = receipt.logs.find((l) => l.topics[0] === AGENT_CREATED_TOPIC);

        if (!log) return null;

        // The ID is in the data field for AgentCreated(uint256)
        if (log.data && log.data !== '0x') {
            return Number(BigInt(log.data));
        }

        return null;
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
                res
                    .status(400)
                    .json({ success: false, error: "Invalid signed transaction format" });
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
                txHash: txResponse.hash,
            });
        } catch (error: any) {
            console.error("❌ Facilitator Broadcast Error:", error);

            res.status(500).json({
                success: false,
                error: "Broadcast failed",
                reason: error.message,
            });
        }
    }
}
