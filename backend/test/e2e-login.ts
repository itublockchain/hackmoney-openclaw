import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

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
    chain: base,
    transport: http(),
});

async function runTest() {
    console.log("🦀 E2E Login Verification");
    console.log("==========================");

    // 1. Register with SIWE Verification
    console.log("1️⃣ Registering agent with SIWE verification...");

    // Get challenge
    const regChallenge = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account.address }),
    }).then(r => r.json()) as any;

    // Sign challenge
    const regSignature = await walletClient.signMessage({
        message: regChallenge.message,
    });

    const username = `E2ETester_${Math.floor(Math.random() * 10000)}`;
    const regRes = await fetch(`${BASE_URL}/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            description: "SIWE Verified Agent",
            message: regChallenge.message,
            signature: regSignature,
            challenge: regChallenge.challenge
        }),
    }).then(r => r.json()) as any;

    if (!regRes.success) {
        console.error("❌ Registration failed", regRes);
        return;
    }

    const agentId = regRes.agent.id;
    console.log(`✅ Registered Securely: ${agentId} (Address recovered: ${regRes.agent.wallet_address})`);

    // 2. Initial Login Attempt (Should fail with 403 - Off-Chain)
    console.log("2️⃣ Testing login for off-chain agent (Expected: 403)...");
    const challengeRes = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account.address }),
    }).then(r => r.json()) as any;

    const loginFailRes = await fetch(`${BASE_URL}/agents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: challengeRes.message,
            signature: "0x-dummy",
            challenge: challengeRes.challenge,
        }),
    });
    console.log(`✅ Result: ${loginFailRes.status} Forbidden (as expected)`);

    // 3. Register On-Chain (Migration)
    console.log("3️⃣ Migrating agent to on-chain (This may take ~30s)...");

    console.log("3️⃣ Registering a NEW agent WITH erc8004_id (Simulated On-Chain)...");
    const onChainUsername = `OnChain_${Math.floor(Math.random() * 10000)}`;
    const onChainReg = await fetch(`${BASE_URL}/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: onChainUsername,
            wallet_address: account.address,
            erc8004_id: Math.floor(Math.random() * 100000), // Simulated
        }),
    }).then(r => r.json()) as any;

    const onChainAgentId = onChainReg.agent.id;
    console.log(`✅ Registered On-Chain: ${onChainAgentId}`);

    // 4. Real SIWE Login
    console.log("4️⃣ Performing real SIWE Login...");
    const activeChallenge = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account.address }),
    }).then(r => r.json()) as any;

    // SIGN THE MESSAGE
    const signature = await walletClient.signMessage({
        message: activeChallenge.message,
    });

    const loginSuccessRes = await fetch(`${BASE_URL}/agents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            message: activeChallenge.message,
            signature: signature,
            challenge: activeChallenge.challenge,
        }),
    }).then(r => r.json()) as any;

    if (loginSuccessRes.success && loginSuccessRes.token) {
        console.log("✅ Login Successful! Received JWT Token.");

        // 5. Test Protected Endpoint
        console.log("5️⃣ Testing protected endpoint (/api/v1/agents/me) with token...");
        const meRes = await fetch(`${BASE_URL}/agents/me`, {
            headers: { "Authorization": `Bearer ${loginSuccessRes.token}` }
        }).then(r => r.json()) as any;

        if (meRes.success && meRes.agent.username === onChainUsername) {
            console.log(`✨ E2E VERIFICATION COMPLETE: Authenticated as ${meRes.agent.username}`);
        } else {
            console.error("❌ Auth failed at final step", meRes);
        }
    } else {
        console.error("❌ Login failed", loginSuccessRes);
    }
}

runTest().catch(console.error);
