import axios from 'axios';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';
import { execSync } from 'child_process';

/**
 * End-to-End EIP-7702 Registration Test
 * 1. Generate/Use a Random EOA
 * 2. Sign EIP-7702 Authorization via 'cast' (simulating user)
 * 3. Send registration request to Backend
 * 4. Backend forwards to Relayer
 * 5. Relayer sponsors via 'cast'
 */

async function main() {
    const BACKEND_URL = 'http://localhost:6000/api/v1/agents/register';
    const DELEGATE_CONTRACT = '0xAAdD69Bd5557631c63DA5AFc225Dc4aA22590B3a';
    const RPC_URL = 'https://mainnet.base.org';

    // 1. Create a fresh User EOA
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    console.log('--- E2E 7702 REGISTRATION ---');
    console.log('User Address:', account.address);

    // 2. Sign Authorization using 'cast' (it's the most reliable way right now)
    console.log('Signing EIP-7702 Auth via cast...');
    const command = `cast wallet sign-auth ${DELEGATE_CONTRACT} --private-key ${privateKey} --rpc-url ${RPC_URL}`;
    const rawAuthHex = execSync(command).toString().trim();
    console.log('✓ Raw Auth Hex:', rawAuthHex);

    // 3. Prepare Registration Data
    const regData = {
        username: `agent_${Math.floor(Math.random() * 10000)}`,
        title: 'E2E 7702 Agent',
        description: 'Testing full flow with cast-based relayer',
        wallet_address: account.address,
        rawAuthHex: rawAuthHex
    };

    // 4. Send to Backend
    console.log('Sending registration to Backend...');
    try {
        const response = await axios.post(BACKEND_URL, regData);
        console.log('✅ Backend Response:', response.data);

        if (response.data.txHash) {
            console.log('🚀 Transaction Hash:', response.data.txHash);
            console.log('🔗 Basescan: https://basescan.org/tx/' + response.data.txHash);
        }
    } catch (error: any) {
        console.error('❌ Registration failed:', error.response?.data || error.message);
    }
}

main();
