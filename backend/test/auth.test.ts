// import { spawnSync } from 'child_process';
// import { privateKeyToAccount } from 'viem/accounts';
// import config from '@/config';

// // Hardcoded key for testing (as requested/implied by user snippet to bypass config issues)
// const PRIVATE_KEY = config.PRIVATE_KEY;
// const API_URL = 'http://localhost:4000/api/v1';

// async function main() {
//     console.log('🧪 Starting SIWE Login Test (using cast)...');
//     try {
//         const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
//         console.log(`👤 Test Account: ${account.address}`);

//         // 1. Get Challenge
//         console.log('\n🔄 Requesting challenge...');
//         const challengePayload = { address: account.address };
//         console.log('📤 Input:', JSON.stringify(challengePayload, null, 2));

//         const challengeRes = await fetch(`${API_URL}/agents/wallet/challenge`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(challengePayload)
//         });

//         const challengeData: any = await challengeRes.json();
//         console.log('tj Challenge Output:', JSON.stringify(challengeData, null, 2));

//         if (!challengeData.success) {
//             console.error('❌ Failed to get challenge');
//             process.exit(1);
//         }

//         const { challenge, message } = challengeData;
//         console.log('✅ Challenge received.');

//         // 2. Sign Message using Cast
//         console.log('\n✍️  Signing message with cast...');
//         console.log('📝 Message to sign:\n', message);

//         let signature = '';
//         try {
//             // Use spawnSync to pass message as an argument safely
//             const child = spawnSync('cast', ['wallet', 'sign', '--private-key', PRIVATE_KEY, message], {
//                 encoding: 'utf-8',
//                 stdio: ['pipe', 'pipe', 'pipe']
//             });

//             if (child.error) {
//                 throw child.error;
//             }

//             if (child.status !== 0) {
//                 console.error('Stderr:', child.stderr);
//                 throw new Error(`Cast failed with status ${child.status}`);
//             }

//             signature = child.stdout.trim();
//         } catch (e: any) {
//             console.error('❌ Cast signing failed:', e.message);
//             process.exit(1);
//         }

//         console.log('✅ Signed with cast.');
//         console.log('Signature:', signature);

//         // 3. Login
//         console.log('\n🔐 Logging in...');
//         const loginPayload = {
//             message,
//             signature,
//             challenge
//         };
//         console.log('📤 Input:', JSON.stringify(loginPayload, null, 2));

//         const loginRes = await fetch(`https://moltlancer.xyz/api/v1/agents/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(loginPayload)
//         });

//         const loginData = await loginRes.json();
//         console.log('📥 Login Output:', JSON.stringify(loginData, null, 2));

//         if (loginData.success) {
//             console.log('\n✅ Login Successful!');
//             console.log('🎫 JWT Token:', loginData.token);
//             console.log('🆔 Agent ID:', loginData.agentId);
//         } else {
//             console.error('\n❌ Login Failed');
//             process.exit(1);
//         }

//     } catch (error) {
//         console.error('❌ Test Error:', error);
//         process.exit(1);
//     }
// }

// main();
