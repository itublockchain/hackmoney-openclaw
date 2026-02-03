import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const BASE_URL = "http://localhost:4000/api/v1";
const rawKey = process.env.PRIVATE_KEY || "";
const PRIVATE_KEY = (rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`).replace(/['"]/g, "") as `0x${string}`;

if (!PRIVATE_KEY || PRIVATE_KEY.length < 64) {
    console.error("❌ PRIVATE_KEY missing or invalid in .env");
    process.exit(1);
}

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
});

async function runTest() {
    console.log("🧪 Broadcast Validation Test");
    console.log("============================");

    let authToken = "";

    try {
        // --- 1. Register & Login ---
        console.log("\n🔑 [STAGE 1] Authentication...");
        const regChallenge = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
        }).then(r => r.json()) as any;

        const regSignature = await walletClient.signMessage({ message: regChallenge.message });
        const username = `TestAgent_${Math.floor(Math.random() * 10000)}`;

        // Try login first (maybe already registered)
        let loginRes = await fetch(`${BASE_URL}/agents/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: regChallenge.message,
                signature: regSignature,
                challenge: regChallenge.challenge
            }),
        }).then(r => r.json()) as any;

        if (!loginRes.success) {
            // Register if login failed
            await fetch(`${BASE_URL}/agents/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    message: regChallenge.message,
                    signature: regSignature,
                    challenge: regChallenge.challenge,
                    wallet_address: account.address
                }),
            });

            // Login again
            const challenge2 = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ address: account.address }),
            }).then(r => r.json()) as any;
            const sig2 = await walletClient.signMessage({ message: challenge2.message });
            loginRes = await fetch(`${BASE_URL}/agents/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: challenge2.message,
                    signature: sig2,
                    challenge: challenge2.challenge
                }),
            }).then(r => r.json()) as any;
        }

        if (!loginRes.success || !loginRes.token) throw new Error("Login failed");
        authToken = loginRes.token;
        console.log("✅ Authenticated");

        // --- 2. Test Auth Protection ---
        console.log("\n🛡️ [STAGE 2] Testing Auth Protection...");
        const unauthRes = await fetch(`${BASE_URL}/agents/broadcast`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signedTx: "0x123" }),
        });

        if (unauthRes.status === 401 || unauthRes.status === 403) {
            console.log("✅ Unauthorized request blocked (Expected 401/403)");
        } else {
            throw new Error(`Auth protection failed. Status: ${unauthRes.status}`);
        }

        // --- 3. Test Invalid Transaction Validation ---
        console.log("\n❌ [STAGE 3] Testing Invalid Transaction Validation...");
        const invalidTxRes = await fetch(`${BASE_URL}/agents/broadcast`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ signedTx: "0xinvalidhexstring" }),
        });

        const invalidBody = await invalidTxRes.json() as any;
        if (invalidTxRes.status === 400 && invalidBody.error?.includes("Invalid signed transaction")) {
            console.log("✅ Invalid transaction rejected (Expected 400)");
        } else {
            throw new Error(`Validation failed. Status: ${invalidTxRes.status}, Error: ${invalidBody.error}`);
        }

        console.log("\n✨ BROADCAST VALIDATION TEST PASSED ✨");
        if ((process as any).env.TEST_EXIT_CODE) process.exit(0);

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error);
        process.exit(1);
    }
}

runTest();
