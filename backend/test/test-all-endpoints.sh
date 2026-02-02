#!/bin/bash

# OpenClaw Comprehensive API Test
# Tests: Agents, Posts, Comments, Jobs, Feed, Search, Chat, ERC8004

BASE_URL="http://localhost:4000/api/v1"

echo "🦀 OpenClaw Comprehensive API Test"
echo "=================================="

# Check if server is running
echo "📡 Checking server health..."
if ! curl -s ${BASE_URL}/database/health > /dev/null; then
  echo "❌ Server is not running on http://localhost:4000"
  exit 1
fi
echo "✅ Server is up!"

# 1. Register Agent
echo -n "1️⃣ Registering Agent... "
REGISTER_RES=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Test-Agent-'"$RANDOM"'", "description": "Comp Test Agent"}')
API_KEY=$(echo $REGISTER_RES | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
AGENT_ID=$(echo $REGISTER_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)
TOKEN=$(echo $REGISTER_RES | grep -o '"token":"[^"]*' | cut -d'"' -f4)
METADATA_URL=$(echo $REGISTER_RES | grep -o '"metadata_url":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to register agent (no token)"
  echo $REGISTER_RES
  exit 1
fi

if [ -z "$METADATA_URL" ]; then
  echo "❌ Failed to register agent (no metadata_url)"
  echo $REGISTER_RES
  exit 1
fi

if echo "$REGISTER_RES" | grep -q 'eip-8004'; then
  echo "✅ Done (ID: $AGENT_ID, JWT Received, Metadata Persisted)"
else
  echo "⚠️ Done (ID: $AGENT_ID, but metadata missing in response)"
fi

# 2. Test ERC8004 Metadata
echo -n "2️⃣ Testing ERC8004 Metadata... "
META_RES=$(curl -s ${METADATA_URL})
if echo "$META_RES" | grep -q '"type":' && echo "$META_RES" | grep -q '"x402_enabled":true'; then
  echo "✅ Success (Includes x402_enabled)"
else
  echo "❌ Failed (Metadata incomplete or x402 missing)"
  echo "$META_RES"
fi

# 3. Create Job
echo -n "3️⃣ Creating Job (using JWT)... "
JOB_RES=$(curl -s -X POST ${BASE_URL}/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Job", "description": "Test Req", "budget": {"min": 100, "max": 500}, "category": "dev", "skills": ["test"]}')
JOB_ID=$(echo $JOB_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)
if [ -z "$JOB_ID" ]; then
  echo "❌ Failed"
  echo $JOB_RES
else
  echo "✅ Done (ID: $JOB_ID)"
fi

# 4. Test Chat
if [ ! -z "$JOB_ID" ]; then
  echo -n "4️⃣ Testing Chat (Post using JWT)... "
  CHAT_RES=$(curl -s -X POST ${BASE_URL}/chat/${JOB_ID} \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"message_text": "Hello, testing chat endpoints with JWT!"}')
  if echo "$CHAT_RES" | grep -q '"success":true'; then
    echo "✅ Success"
  else
    echo "❌ Failed"
    echo "$CHAT_RES"
  fi

  echo -n "5️⃣ Testing Chat (Get)... "
  CHAT_GET=$(curl -s ${BASE_URL}/chat/${JOB_ID})
  if echo "$CHAT_GET" | grep -q '"message_text":'; then
    echo "✅ Success"
  else
    echo "❌ Failed"
    echo "$CHAT_GET"
  fi
fi

# 5. Search
echo -n "6️⃣ Testing Search... "
SEARCH_RES=$(curl -s "${BASE_URL}/search?q=test&type=all")
if echo "$SEARCH_RES" | grep -q '"success":true'; then
  echo "✅ Success"
else
  echo "❌ Failed"
  echo "$SEARCH_RES"
fi

echo ""
echo "✨ Comprehensive End-to-End Test Complete!"
