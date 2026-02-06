
import { createWalletClient, http, toHex, keccak256, encodeFunctionData, parseEther } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { base } from "viem/chains";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env from parent .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
    console.log("--- SIMPLE 7702 DELEGATION TEST ---");

    // CONFIG
    const RPC_URL = "https://mainnet.base.org";
    // Verified Delegate Contract
    const DELEGATE_CONTRACT = "0x630588Eb9f5D91CaE2D4BD581344958dF822Da41";

    // 1. Relayer Key (Sponsor)
    let RELAYER_KEY = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    if (!RELAYER_KEY) {
        console.error("❌ RELAYER_PRIVATE_KEY or PRIVATE_KEY missing in .env");
        console.log("Env path tried:", path.resolve(__dirname, "../.env"));
        process.exit(1);
    }
    if (!RELAYER_KEY.startsWith("0x")) RELAYER_KEY = `0x${RELAYER_KEY}`;

    // 2. Fresh User EOA
    const userPrivateKey = generatePrivateKey();
    const userAccount = privateKeyToAccount(userPrivateKey);
    console.log(`User Address (EOA): ${userAccount.address}`);
    console.log(`User PK: ${userPrivateKey}`);

    // 3. Delegation Payload (Sign Auth)
    // We authorize DELEGATE_CONTRACT to enforce code on User EOA
    console.log(`\nDelegating to: ${DELEGATE_CONTRACT}`);

    // Construct EIP-7702 Authorization
    // We effectively sign: [chain_id, address, nonce]
    // BUT we need `cast wallet sign-auth` format or viem's experimental signAuthorization?
    // Since we want to replicate 'cast' behavior exactly from the script, let's use `cast wallet sign-auth`
    // assuming 'cast' is installed.

    // 3. Delegation Payload (Sign Auth)
    console.log(`\nDelegating to: ${DELEGATE_CONTRACT}`);

    // Exact command format from E2E script
    console.log("Signing Authorization via cast...");
    const commandSign = `cast wallet sign-auth ${DELEGATE_CONTRACT} --private-key ${userPrivateKey} --rpc-url ${RPC_URL}`;
    let authTupleHex = "";

    try {
        authTupleHex = execSync(commandSign).toString().trim();
        console.log(`✓ Auth Tuple: ${authTupleHex.substring(0, 50)}...`);
    } catch (e: any) {
        console.error("❌ Signing failed:", e.message);
        process.exit(1);
    }

    // 4. Construct Transaction Payload
    // We want to CALL the User EOA (which now has code) to execute 'register'.
    // The 'to' address of the transaction is the User EOA.
    // The 'data' is the calldata for 'executeRegister'.

    const agentURI = `https://test-delegation-${Date.now()}.com`;
    const DATA = encodeFunctionData({
        abi: [{
            inputs: [{ internalType: "string", name: "agentURI", type: "string" }],
            name: "executeRegister",
            outputs: [{ internalType: "uint256", name: "agentId", type: "uint256" }],
            stateMutability: "nonpayable",
            type: "function"
        }],
        functionName: "executeRegister",
        args: [agentURI]
    });

    // 5. Broadcast via Relayer (Sponsor)
    console.log("\nBroadcasting via Relayer (Cast)...");

    // cast send <TO> <DATA> --auth <AUTH> --private-key <RELAYER>
    const commandSend = `cast send ${userAccount.address} ${DATA} --auth ${authTupleHex} --private-key ${RELAYER_KEY} --rpc-url ${RPC_URL} --json`;

    try {
        const output = execSync(commandSend).toString();
        const res = JSON.parse(output);
        console.log("\n✅ Transaction Sent!");
        console.log(`Tx Hash: ${res.transactionHash}`);
        console.log(`View: https://basescan.org/tx/${res.transactionHash}`);
        console.log(`Status: ${res.status}`);

        if (res.status === "0x0") {
            console.error("❌ REVERTED ON CHAIN");
            // Inspect logs if any?
        }
    } catch (e: any) {
        console.error("❌ Send failed:");
        console.error(e.stderr?.toString() || e.message);
    }
}

main();
