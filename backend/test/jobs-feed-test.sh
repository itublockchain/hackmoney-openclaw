#!/bin/bash

# Moltlancer Jobs & Feed Verification Script
# This script tests:
# 1. Agent Registration (ERC8004 compatible)
# 2. Agent Profile Retrieval
# 3. Job Creation (Flexible inputs)
# 4. Job Feed (Global & Personalized)
# Moltlancer Jobs & Feed Test
#
# 1. Feed (Public)
# 2. Search (Public & Semantic)

BASE_URL="http://localhost:4000/api/v1"
TIMESTAMP=$(date +%s)
AGENT_NAME="Test-Agent-${TIMESTAMP}"

echo "🦀 Moltlancer Jobs & Feed Test"
echo "========================="

# 1. Register Agent
echo "1️⃣ Registering Agent: ${AGENT_NAME}"
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${AGENT_NAME}\",
    \"description\": \"Autonomous AI agent for testing jobs feed.\",
    \"title\": \"Quality Assurance Agent\",
    \"wallet_address\": \"0x$(openssl rand -hex 20)\",
    \"erc8004_address\": \"0x$(openssl rand -hex 20)\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    API_KEY=$(echo "$REGISTER_RESPONSE" | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Registered! API Key: $API_KEY"
else
    echo "   ❌ Registration failed:"
    echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
    exit 1
fi
echo ""

# 2. Get Profile
echo "2️⃣ Verifying Profile (getMe)..."
ME_RESPONSE=$(curl -s -X GET ${BASE_URL}/agents/me \
  -H "Authorization: Bearer $API_KEY")

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
    RETURN_NAME=$(echo "$ME_RESPONSE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Profile retrieved! Name in system: $RETURN_NAME"
else
    echo "   ❌ Profile retrieval failed"
    echo "$ME_RESPONSE"
fi
echo ""

# 3. Create Jobs
echo "3️⃣ Creating test jobs..."
for i in {1..2}
do
    JOB_RESPONSE=$(curl -s -X POST ${BASE_URL}/jobs \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d "{
        \"title\": \"AI Task #${i} - ${TIMESTAMP}\",
        \"description\": \"Perform automated analysis for task ${i}\",
        \"budget\": 500,
        \"category\": \"automation\"
      }")
    if echo "$JOB_RESPONSE" | grep -q '"success":true'; then
        JOB_ID=$(echo "$JOB_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "   ✅ Job #${i} created! ID: $JOB_ID"
    else
        echo "   ❌ Job #${i} creation failed"
        echo "$JOB_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$JOB_RESPONSE"
    fi
done
echo ""

# 4. Global Feed
echo "4️⃣ Checking Global Feed..."
FEED_RESPONSE=$(curl -s -X GET ${BASE_URL}/feed)
if echo "$FEED_RESPONSE" | grep -q '"success":true'; then
    COUNT=$(echo "$FEED_RESPONSE" | grep -o '"id":' | wc -l)
    echo "   ✅ Global Feed active! Total jobs: $COUNT"
else
    echo "   ❌ Global Feed failed"
    echo "$FEED_RESPONSE"
fi
echo ""

# 5. On-Chain Registration (Optional test - might fail if keys not set)
echo "5️⃣ Testing On-Chain Registration (ERC8004)..."
BLOCKCHAIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/agents/me/register-on-chain \
  -H "Authorization: Bearer $API_KEY")

if echo "$BLOCKCHAIN_RESPONSE" | grep -q '"success":true'; then
    BC_ID=$(echo "$BLOCKCHAIN_RESPONSE" | grep -o '"agentId":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ On-Chain Registration Success! Agent ID: $BC_ID"
else
    echo "   ⚠️ On-Chain Registration skipped or failed (check server logs/config)"
    # We don't exit here as it depends on external blockchain connectivity
fi
echo ""

# 6. ERC8004 Metadata
echo "6️⃣ Checking ERC8004 Metadata Endpoint..."
METADATA_RESPONSE=$(curl -s -X GET ${BASE_URL}/agents/${API_KEY}/metadata)
if echo "$METADATA_RESPONSE" | grep -q 'eip-8004'; then
    image_url=$(echo "$METADATA_RESPONSE" | grep -o '"image":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ ERC8004 Metadata valid!"
    echo "   🖼️ Image: $image_url"
    echo "   📡 Endpoints found in metadata: $(echo "$METADATA_RESPONSE" | grep -o 'endpoint' | wc -l)"
else
    echo "   ❌ ERC8004 Metadata retrieval failed or invalid"
    echo "$METADATA_RESPONSE"
fi
echo ""

# 7. Stats
echo "📊 Final Database Statistics..."
curl -s ${BASE_URL}/database/stats | python3 -m json.tool 2>/dev/null || echo "   ⚠️ Stats retrieval failed"

echo ""
echo "✅ Comprehensive Jobs-only Feed Test Complete!"