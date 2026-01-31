#!/usr/bin/env node

async function testJWT() {
    const BASE_URL = 'http://localhost:4000/api/v1';

    console.log('🔐 JWT Token Testing Suite\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Generate Challenge Token
        console.log('\n📝 Test 1: Generate Challenge Token');
        console.log('-'.repeat(60));

        const challengeResponse = await fetch(`${BASE_URL}/agents/wallet/challenge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8'
            })
        });

        if (!challengeResponse.ok) {
            const errorText = await challengeResponse.text();
            console.log('❌ Failed:', challengeResponse.status);
            console.log('Response:', errorText.substring(0, 200));
            return;
        }

        const challengeData = await challengeResponse.json();
        console.log('✅ Challenge token generated successfully!');
        console.log('   Success:', challengeData.success);
        console.log('   Nonce:', challengeData.nonce);
        console.log('   Token (first 50 chars):', challengeData.challenge.substring(0, 50) + '...');
        console.log('   Message:', challengeData.message);

        // Test 2: Decode Token
        console.log('\n🔍 Test 2: Decode Challenge Token');
        console.log('-'.repeat(60));

        // Decode JWT (simple base64 decode of payload)
        const parts = challengeData.challenge.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
            console.log('✅ Token decoded successfully!');
            console.log('   Address:', payload.address);
            console.log('   Nonce:', payload.nonce);
            console.log('   Type:', payload.type);
            console.log('   Issued At:', new Date(payload.iat * 1000).toLocaleString());
            console.log('   Expires At:', new Date(payload.exp * 1000).toLocaleString());

            // Verify expiry is ~15 minutes from now
            const expiryDuration = (payload.exp - payload.iat) / 60;
            console.log('   Duration:', expiryDuration, 'minutes');

            if (Math.abs(expiryDuration - 15) < 1) {
                console.log('   ✅ Expiry duration is correct (15 minutes)');
            } else {
                console.log('   ⚠️  Expiry duration unexpected:', expiryDuration, 'minutes');
            }
        }

        // Test 3: Validate Token Structure
        console.log('\n🧪 Test 3: Validate Token Structure');
        console.log('-'.repeat(60));

        const checks = [
            { name: 'Has success field', pass: challengeData.success === true },
            { name: 'Has challenge token', pass: typeof challengeData.challenge === 'string' && challengeData.challenge.length > 0 },
            { name: 'Has nonce', pass: typeof challengeData.nonce === 'string' && challengeData.nonce.length > 0 },
            { name: 'Has message', pass: typeof challengeData.message === 'string' && challengeData.message.includes('OpenClaw') },
            { name: 'Token has 3 parts (JWT)', pass: challengeData.challenge.split('.').length === 3 },
        ];

        checks.forEach(check => {
            console.log(`   ${check.pass ? '✅' : '❌'} ${check.name}`);
        });

        const allPassed = checks.every(c => c.pass);

        console.log('\n' + '='.repeat(60));
        if (allPassed) {
            console.log('✨ All JWT tests passed! Token generation is working correctly.');
        } else {
            console.log('⚠️  Some tests failed. Please review the output above.');
        }

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        console.error(error.stack);
    }
}

testJWT();
