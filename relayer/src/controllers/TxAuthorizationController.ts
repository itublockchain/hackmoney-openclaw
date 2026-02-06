import type { Request, Response } from "express";
import { createBundlerClient } from "viem/account-abstraction";
import { to7702SimpleSmartAccount } from "permissionless/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import config from "../config";

export const submitWith7702 = async (req: Request, res: Response) => {
    try {
        const { userOp, authorization } = req.body;

        if (!userOp) {
            res.status(400).json({ error: "Missing userOp" });
            return;
        }

        const { chain, publicClient, account: relayerAccount } = config;

        const paymasterClient = createPimlicoClient({
            transport: http(config.COINBASE_PAYMASTER_URL),
            chain,
            entryPoint: {
                address: "0x433709009B8330FDa32311DF1C2AFA402eD8D009", // EntryPoint 0.9
                version: "0.9"
            }
        });

        const account = await to7702SimpleSmartAccount({
            client: publicClient,
            owner: relayerAccount,
        });

        const bundlerClient = createBundlerClient({
            chain,
            transport: http(config.BUNDLER_URL),
            paymaster: paymasterClient,
            account,
        });

        const hash = await bundlerClient.sendUserOperation({
            userOperation: {
                ...userOp,
                ...((authorization ? { authorizationList: [authorization] } : {}) as any)
            },
        } as any);

        res.json({ success: true, userOpHash: hash });
    } catch (error) {
        console.error("Relay Error:", error);
        res.status(500).json({ error: (error as Error).message });
    }
};
