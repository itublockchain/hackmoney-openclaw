
import { randomUUID } from "node:crypto";

const PORT = 4000; // Adjust if your server is running on a different port
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const agentName = `TestAgent-${randomUUID().slice(0, 8)}`;
const agentDesc = "An agent for verifying ERC8004 endpoints";

async function main() {
    console.log("=== Starting ERC8004 Verification Script ===\n");

    // 1. Register a new agent
    console.log(`1. Registering agent: ${agentName}...`);
    const registerResponse = await fetch(`${BASE_URL}/agents/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: agentName, description: agentDesc }),
    });

    if (!registerResponse.ok) {
        console.error("Failed to register agent:", await registerResponse.text());
        return;
    }

    const registerData = await registerResponse.json() as any;
    const apiKey = registerData.agent.api_key;
    console.log(`SUCCESS: Agent registered with API Key: ${apiKey}\n`);

    // 2. Verify agent details
    console.log("2. Verifying agent details...");
    const meResponse = await fetch(`${BASE_URL}/agents/me`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!meResponse.ok) {
        console.error("Failed to fetch agent details:", await meResponse.text());
        return;
    }

    let meData: any = await meResponse.json();
    console.log(`SUCCESS: Verified agent ID: ${meData.agent.id}\n`);

    // 3. Register on-chain
    console.log("3. Registering agent on-chain (this may take a moment)...");
    const onChainResponse = await fetch(`${BASE_URL}/agents/me/register-on-chain`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!onChainResponse.ok) {
        console.error("Failed to register on-chain:", await onChainResponse.text());
        return;
    }

    const onChainData = await onChainResponse.json() as any;
    console.log("SUCCESS: On-chain registration complete.");
    console.log(`Tx Hash: ${onChainData.txHash}`);
    console.log(`Agent ID: ${onChainData.agentId}`);
    console.log(`Metadata URL: ${onChainData.metadataUrl}\n`);

    // 4. Verify metadata update
    console.log("4. Verifying metadata update...");
    const meResponse2 = await fetch(`${BASE_URL}/agents/me`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!meResponse2.ok) {
        console.error("Failed to fetch agent details:", await meResponse2.text());
        return;
    }

    meData = await meResponse2.json();
    const blockchainId = meData.agent.metadata?.blockchainId;
    if (blockchainId) {
        console.log(`SUCCESS: Agent has blockchainId in metadata: ${blockchainId}\n`);
    } else {
        console.error("FAILURE: Agent missing blockchainId in metadata: ", meData.agent.metadata);
        return;
    }

    // 5. Update metadata on-chain
    console.log("5. Updating metadata on-chain...");
    const updateResponse = await fetch(`${BASE_URL}/agents/me/metadata-on-chain`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!updateResponse.ok) {
        console.error("Failed to update metadata on-chain:", await updateResponse.text());
        return;
    }

    const updateData = await updateResponse.json() as any;
    console.log("SUCCESS: Metadata updated on-chain.");
    console.log(`Tx Hash: ${updateData.txHash}`);
    console.log(`New Metadata URL: ${updateData.metadataUrl}\n`);

    // 6. Verify final metadata
    console.log("6. Verifying final metadata...");
    const meResponse3 = await fetch(`${BASE_URL}/agents/me`, {
        headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!meResponse3.ok) {
        console.error("Failed to fetch agent details:", await meResponse3.text());
        return;
    }

    meData = await meResponse3.json();

    if (meData.agent.metadata.metadataUrl === updateData.metadataUrl) {
        console.log("SUCCESS: Metadata URL matches on-chain update.\n");
    } else {
        console.error("FAILURE: Metadata URL mismatch.");
        console.log(`Expected: ${updateData.metadataUrl}`);
        console.log(`Found: ${meData.agent.metadata.metadataUrl}`);
        return;
    }

    console.log("=== API Verification Complete: ALL TESTS PASSED ===");
}

main().catch(console.error);
