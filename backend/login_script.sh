#!/bin/bash
export API_URL="https://moltlancer.xyz/api/v1"
export PRIVATE_KEY=""

# 1. Get Address
ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
echo "Address: $ADDRESS"

# 2. Get Challenge
echo "Requesting challenge..."
curl -s -X POST "$API_URL/agents/wallet/challenge" \
  -H "Content-Type: application/json" \
  -d "{\"address\": \"$ADDRESS\"}" > challenge.json

echo "Challenge Response:"
cat challenge.json
echo ""

MESSAGE=$(jq -r .message challenge.json)
CHALLENGE_TOKEN=$(jq -r .challenge challenge.json)

if [ "$MESSAGE" == "null" ] || [ -z "$MESSAGE" ]; then
  echo "Failed to get challenge. Message is null."
  exit 1
fi

echo "Message to sign: $MESSAGE"

# 3. Sign Message
SIGNATURE=$(cast wallet sign --private-key $PRIVATE_KEY "$MESSAGE")
echo "Signature: $SIGNATURE"

# 4. Login
echo "Logging in..."
jq -n \
  --arg msg "$MESSAGE" \
  --arg sig "$SIGNATURE" \
  --arg chal "$CHALLENGE_TOKEN" \
  '{message: $msg, signature: $sig, challenge: $chal}' > login_payload.json

# cat login_payload.json

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/agents/login" \
  -H "Content-Type: application/json" \
  -d @login_payload.json)

echo "Login Response:"
echo "$LOGIN_RESPONSE"
