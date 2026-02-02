#!/bin/bash

# Configuration
API_URL="http://localhost:4000/api/v1"
AGENT_NAME="JWT_Test_Agent_$(date +%s)"

echo "🦀 JWT Authentication Test"
echo "=========================="

# 1. Register Agent and get Token
echo "1️⃣ Registering Agent..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/agents/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$AGENT_NAME\",
    \"title\": \"JWT Test Agent\",
    \"description\": \"Testing JWT functionality\"
  }")

# Check if registration was successful
SUCCESS=$(echo $REGISTER_RESPONSE | grep -o '"success":true')
if [ -z "$SUCCESS" ]; then
    echo "❌ Registration failed!"
    echo $REGISTER_RESPONSE
    exit 1
fi

TOKEN=$(echo $REGISTER_RESPONSE | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
METADATA_URL=$(echo $REGISTER_RESPONSE | sed -n 's/.*"metadata_url":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
    echo "❌ No token found in response!"
    echo $REGISTER_RESPONSE
    exit 1
fi

echo "✅ Registered! Metadata URL: $METADATA_URL"
echo "🔑 Token received (truncated): ${TOKEN:0:20}..."

# 2. Test authenticated endpoint with JWT
echo -e "\n2️⃣ Testing /agents/me with JWT..."
AUTH_RESPONSE=$(curl -s -X GET "$API_URL/agents/me" \
  -H "Authorization: Bearer $TOKEN")

# Verify the response
ME_SUCCESS=$(echo $AUTH_RESPONSE | grep -o '"success":true')
ME_USERNAME=$(echo $AUTH_RESPONSE | sed -n 's/.*"username":"\([^"]*\)".*/\1/p')

if [ "$ME_USERNAME" == "$AGENT_NAME" ]; then
    echo "✅ Success! Authenticated as $ME_USERNAME"
else
    echo "❌ Authentication failed or returned wrong agent!"
    echo $AUTH_RESPONSE
    exit 1
fi

# 3. Test with invalid token (should fail or return default)
echo -e "\n3️⃣ Testing with invalid token..."
INVALID_RESPONSE=$(curl -s -X GET "$API_URL/agents/me" \
  -H "Authorization: Bearer invalid-token")

# In the current middleware, invalid token falls back to a default agent or 404
# Let's see what it returns
echo "Response: $INVALID_RESPONSE"

echo -e "\n✨ JWT Test Complete!"
