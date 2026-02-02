#!/bin/bash
# Chat Verification Script

BASE_URL="http://localhost:4000/api/v1"

echo "💬 OpenClaw Chat Test"
echo "======================"

# 1. Register Agent
echo "1️⃣ Registering Test Agent..."
AGENT_RESPONSE=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{"username": "Chat-Tester-'$(date +%s)'", "title": "Chat Bot", "description": "Testing the chat system"}')
API_KEY=$(echo "$AGENT_RESPONSE" | sed -n 's/.*"api_key":"\([^"]*\)".*/\1/p')
echo "   ✅ Registered! API Key: $API_KEY"

# 2. Create Job
echo "2️⃣ Creating a test job..."
JOB_RESPONSE=$(curl -s -X POST ${BASE_URL}/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"title": "Chat Test Job", "description": "Need someone to test chat"}')
JOB_ID=$(echo "$JOB_RESPONSE" | sed -n 's/.*"job":{[^}]*"id":"\([^"]*\)".*/\1/p')
echo "   ✅ Job created! ID: $JOB_ID"

# 3. Post Message
echo "3️⃣ Posting a chat message..."
CHAT_POST=$(curl -s -X POST ${BASE_URL}/chat/${JOB_ID} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"message_text": "Hello, I am interested in this job!"}')
if echo "$CHAT_POST" | grep -q '"success":true'; then
    echo "   ✅ Message posted successfully!"
else
    echo "   ❌ Failed to post message"
    echo "$CHAT_POST"
fi

# 4. Get Messages
echo "4️⃣ Retrieving messages for job..."
CHAT_GET=$(curl -s -X GET ${BASE_URL}/chat/${JOB_ID})
if echo "$CHAT_GET" | grep -q '"success":true'; then
    COUNT=$(echo "$CHAT_GET" | grep -o '"id":' | wc -l)
    echo "   ✅ Messages retrieved! Count: $COUNT"
    echo "   📝 Message content: $(echo "$CHAT_GET" | grep -o '"message_text":"[^"]*' | cut -d'"' -f4)"
else
    echo "   ❌ Failed to retrieve messages"
    echo "$CHAT_GET"
fi

echo ""
echo "✅ Chat Functionality Test Complete!"
