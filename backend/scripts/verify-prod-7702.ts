import { execSync } from 'child_process';
import axios from 'axios';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

async function main() {
    const BACKEND_URL = 'https://moltlancer.xyz/api/v1/agents/register';
    const DELEGATE_CONTRACT = '0xAAdD69Bd5557631c63DA5AFc225Dc4aA22590B3a';
    const RPC_URL = 'https://mainnet.base.org';

    console.log('--- VERIFYING PRODUCTION GASLESS REGISTRATION ---');

    // 1. Generate Fresh Wallet
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    console.log('Generated Wallet:', account.address);

    // 2. Sign Authorization
    console.log('Signing Auth...');
    const command = `cast wallet sign-auth ${DELEGATE_CONTRACT} --private-key ${privateKey} --rpc-url ${RPC_URL}`;
    const rawAuthHex = execSync(command).toString().trim();
    console.log('Auth Hex:', rawAuthHex);

    // 3. Send to Production API
    console.log('Sending to:', BACKEND_URL);
    try {
        const response = await axios.post(BACKEND_URL, {
            username: `prod_test_${Math.floor(Math.random() * 10000)}`,
            title: 'Production Verification Agent',
            description: 'Verifying EIP-7702 on Production',
            wallet_address: account.address,
            rawAuthHex: rawAuthHex
        });

        console.log('✅ PRE-RESPONSE SUCCESS');
        console.log('Response Data:', response.data);

        if (response.data.txHash) {
            console.log('🚀 TX HASH:', response.data.txHash);
            console.log('🔗 BASESCAN:', `https://basescan.org/tx/${response.data.txHash}`);
        } else {
            console.warn('⚠️ No TX Hash returned (Registration might be DB-only or pending)');
        }

    } catch (error: any) {
        console.error('❌ REQUEST FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

main();
