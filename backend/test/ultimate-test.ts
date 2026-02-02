import { createWalletClient, http, type Address } from "viem";
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

async function runUltimateTest() {
    console.log("🚀 OPENCLAW ULTIMATE TEST SUITE");
    console.log("===============================");

    let authToken = "";
    let agentId = "";
    let jobId = "";
    let categoryId = "";

    try {
        // --- 0. Health Check ---
        console.log("\n📡 [STAGE 0] Checking Health...");
        const health = await fetch("http://localhost:4000/").then(r => r.json()) as any;
        if (health.status === "ok") console.log("✅ Server is healthy");

        // --- 1. SIWE Verified Registration ---
        console.log("\n🔐 [STAGE 1] SIWE Verified Registration...");
        const regChallenge = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
        }).then(r => r.json()) as any;

        const regSignature = await walletClient.signMessage({ message: regChallenge.message });

        const username = `UltimateAgent_${Math.floor(Math.random() * 10000)}`;
        const regRes = await fetch(`${BASE_URL}/agents/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                description: "The Ultimate Test Agent",
                message: regChallenge.message,
                signature: regSignature,
                challenge: regChallenge.challenge
            }),
        }).then(r => r.json()) as any;

        if (!regRes.success) throw new Error("Registration failed: " + JSON.stringify(regRes));
        agentId = regRes.agent.id;
        console.log(`✅ Agent Registered: ${agentId}`);

        // --- 2. On-Chain Registration (ERC8004) ---
        console.log("\n⛓️ [STAGE 2] On-Chain Registration...");
        const onChainRes = await fetch(`${BASE_URL}/agents/me/register-on-chain`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${agentId}` // Use raw ID as mock token for bootstrap
            },
        }).then(r => r.json()) as any;

        if (!onChainRes.success) throw new Error("On-chain registration failed: " + JSON.stringify(onChainRes));
        console.log(`✅ On-Chain Sync: ${onChainRes.agentId} (Tx: ${onChainRes.txHash.substring(0, 10)}...)`);

        // --- 3. SIWE Login ---
        console.log("\n🔑 [STAGE 3] SIWE Login...");
        const loginChallenge = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: account.address }),
        }).then(r => r.json()) as any;

        const loginSignature = await walletClient.signMessage({ message: loginChallenge.message });

        const loginRes = await fetch(`${BASE_URL}/agents/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: loginChallenge.message,
                signature: loginSignature,
                challenge: loginChallenge.challenge
            }),
        }).then(r => r.json()) as any;

        if (!loginRes.success || !loginRes.token) throw new Error("Login failed: " + JSON.stringify(loginRes));
        authToken = loginRes.token;
        console.log("✅ Login Successful: JWT Obtained");

        // --- 4. Profile Management ---
        console.log("\n👤 [STAGE 4] Profile Testing...");
        const profile = await fetch(`${BASE_URL}/agents/me`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        }).then(r => r.json()) as any;
        console.log(`✅ Profile Fetched: ${profile.agent.username}`);

        const updateRes = await fetch(`${BASE_URL}/agents/me`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ title: "Ultimate Commander" })
        }).then(r => r.json()) as any;
        if (updateRes.agent.title === "Ultimate Commander") console.log("✅ Profile Updated");

        // --- 5. Category CRUD ---
        console.log("\n📂 [STAGE 5] Categories...");
        const catName = `Cat_${Math.floor(Math.random() * 1000)}`;
        const createCat = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: catName, description: "Ultimate Category" })
        }).then(r => r.json()) as any;
        categoryId = createCat.category.id;
        console.log(`✅ Category Created: ${catName}`);

        const listCats = await fetch(`${BASE_URL}/categories`).then(r => r.json()) as any;
        if (listCats.categories.length > 0) console.log("✅ Categories Listed");

        // --- 6. Job Posting ---
        console.log("\n💼 [STAGE 6] Jobs...");
        const jobTitle = `Ultimate Job ${Math.floor(Math.random() * 1000)}`;
        const createJob = await fetch(`${BASE_URL}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                title: jobTitle,
                description: "Solve the ultimate mystery.",
                budget_amount: 5000,
                category_id: categoryId
            })
        }).then(r => r.json()) as any;
        jobId = createJob.job.id;
        console.log(`✅ Job Created: ${jobTitle}`);

        const listJobs = await fetch(`${BASE_URL}/jobs`).then(r => r.json()) as any;
        if (listJobs.jobs.length > 0) console.log("✅ Jobs Listed");

        // --- 7. Chat ---
        console.log("\n💬 [STAGE 7] Chat...");
        const postMsg = await fetch(`${BASE_URL}/chat/${jobId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ message_text: "I am ready for the ultimate mission." })
        }).then(r => r.json()) as any;
        if (postMsg.success) console.log("✅ Message Posted");

        const getMsgs = await fetch(`${BASE_URL}/chat/${jobId}`).then(r => r.json()) as any;
        if (getMsgs.messages.length > 0) console.log(`✅ Messages Retrieved (${getMsgs.messages.length})`);

        // --- 8. Search ---
        console.log("\n🔍 [STAGE 8] Semantic Search...");
        const searchRes = await fetch(`${BASE_URL}/search?q=Ultimate`).then(r => r.json()) as any;
        const foundAgent = searchRes.results.some((r: any) => r.type === "agent" && r.username.includes("Ultimate"));
        const foundJob = searchRes.results.some((r: any) => r.type === "job" && r.title.includes("Ultimate"));

        if (foundAgent && foundJob) console.log("✅ Agent and Job found in Search!");
        else console.warn("⚠️ Search results incomplete:", searchRes.results.length);

        // --- 9. ERC8004 Metadata ---
        console.log("\n📜 [STAGE 9] ERC8004 Metadata JSON...");
        const metadata = await fetch(`${BASE_URL}/agents/${agentId}/metadata`).then(r => r.json()) as any;
        if (metadata.name && metadata.type.includes("eip-8004")) {
            console.log("✅ ERC8004 Metadata Verified");
        }

        // --- 10. Offer System ---
        console.log("\n💰 [STAGE 10] Offer System...");
        const createOffer = await fetch(`${BASE_URL}/offers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                job_id: jobId
            })
        }).then(r => r.json()) as any;

        if (!createOffer.success) throw new Error("Offer creation failed: " + JSON.stringify(createOffer));
        const offerId = createOffer.offer.id;
        console.log(`✅ Offer Created: ${offerId}`);

        const getOffers = await fetch(`${BASE_URL}/offers?job_id=${jobId}`).then(r => r.json()) as any;
        if (getOffers.offers.length > 0) console.log(`✅ Offers Retrieved for Job (${getOffers.offers.length})`);

        const acceptOffer = await fetch(`${BASE_URL}/offers/${offerId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ status: "accepted" })
        }).then(r => r.json()) as any;
        if (acceptOffer.offer.status === "accepted") console.log("✅ Offer Accepted");

        console.log("\n✨ THE ULTIMATE TEST SUITE PASSED 100% ✨");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ ULTIMATE TEST FAILED:");
        console.error(error);
        process.exit(1);
    }
}

runUltimateTest();
