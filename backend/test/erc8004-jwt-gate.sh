#!/bin/bash

BASE_URL="http://localhost:4000/api/v1"
TEST_WALLET="0x40f8F0064c34CA1B7E4986fdadfb94842D547103"

echo "🦀 ERC8004 JWT Gate Test"
echo "========================="

# 1. Test registration WITHOUT wallet_address (Should fail)
echo -n "1️⃣ Testing registration without wallet_address... "
REG_FAIL=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{"username": "NoWalletAgent_'"$RANDOM"'" }')

if echo "$REG_FAIL" | grep -q "Wallet address is required"; then
  echo "✅ Success (Rejected as expected)"
else
  echo "❌ Failed (Should have rejected missing wallet)"
  echo $REG_FAIL
  exit 1
fi

# 2. Register agent WITHOUT erc8004_id
echo -n "2️⃣ Registering agent WITHOUT erc8004_id... "
REG_NO_CHAIN=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{"username": "OffChainAgent_'"$RANDOM"'", "wallet_address": "'"$TEST_WALLET"'", "description": "Test description" }')

TOKEN_OFF=$(echo $REG_NO_CHAIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN_OFF" ] || [ "$TOKEN_OFF" == "null" ]; then
  echo "✅ Success (No token issued)"
else
  echo "❌ Failed (Token issued for off-chain agent)"
  echo $REG_NO_CHAIN
  exit 1
fi

AGENT_ID=$(echo $REG_NO_CHAIN | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# 3. Try protected endpoint with NO token (Should fail with 401)
echo -n "3️⃣ Testing protected endpoint (/jobs) without token... "
JOB_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/jobs \
  -H "Content-Type: application/json" \
  -d '{"title": "Fail Job"}')

if [ "$JOB_RES" == "401" ]; then
  echo "✅ Success (401 Unauthorized as expected)"
else
  echo "❌ Failed (Got HTTP $JOB_RES, expected 401)"
fi

# 4. Register agent WITH erc8004_id
echo -n "4️⃣ Registering agent WITH erc8004_id... "
REG_WITH_CHAIN=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{"username": "OnChainAgent_'"$RANDOM"'", "wallet_address": "0x1234567890123456789012345678901234567890", "erc8004_id": 123}')

TOKEN_ON=$(echo $REG_WITH_CHAIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$TOKEN_ON" ] && [ "$TOKEN_ON" != "null" ]; then
  echo "✅ Success (Token issued)"
else
  echo "❌ Failed (No token issued for on-chain agent)"
  echo $REG_WITH_CHAIN
  exit 1
fi

# 5. Perform on-chain registration for the OFF-CHAIN agent
echo -n "5️⃣ Progressing off-chain agent to on-chain... "
# Use the Agent ID as the auth token (fallback to API key works in authMiddleware)
ONCHAIN_RES=$(curl -s -X POST ${BASE_URL}/agents/me/register-on-chain \
  -H "Authorization: Bearer $AGENT_ID" \
  -H "Content-Type: application/json")

NEW_TOKEN=$(echo $ONCHAIN_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ ! -z "$NEW_TOKEN" ] && [ "$NEW_TOKEN" != "null" ]; then
  echo "✅ Success (Token issued after migration)"
else
  echo "❌ Failed (No token after migration)"
  echo $ONCHAIN_RES
  exit 1
fi

# 6. Verify the new token works for /jobs
echo -n "6️⃣ Verifying new token works for /jobs... "
FINAL_JOB_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST ${BASE_URL}/jobs \
  -H "Authorization: Bearer $NEW_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Success Job"}')

if [ "$FINAL_JOB_RES" == "201" ]; then
  echo "✅ Success (201 Created)"
else
  echo "❌ Failed (Got HTTP $FINAL_JOB_RES, expected 201)"
fi

echo ""
echo "✨ Mandatory Wallet & Gate Test Complete!"
