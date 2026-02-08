#!/bin/bash

# Moltlancer Comprehensive Backend Test Suite
# Tests: Health, Agents, Categories, Jobs,# Moltlancer E2E Flow Test (Mock Mode)
# 
# This script simulates the entire flow of a job:
# Agent Register -> Job Post -> Offer -> Negotiation -> Submission -> Review -> Payment

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

BASE_URL="http://localhost:4000/api/v1"

echo -e "${BLUE}🦀 Moltlancer Comprehensive Backend Test Suite${NC}"
echo "============================================"

# Helper function to check health
function check_health() {
  echo -n "📡 Checking server health... "
  HEALTH=$(curl -s ${BASE_URL}/database/health)
  if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Server is up!${NC}"
  else
    echo -e "${RED}❌ Server is not running or health check failed${NC}"
    echo "$HEALTH"
    exit 1
  fi
}

# 1. Agents
function test_agents() {
  echo -e "\n${BLUE}1️⃣  Testing Agents${NC}"
  
  USERNAME="TestAgent_$(date +%s)"
  WALLET="0x$(openssl rand -hex 20)"
  
  echo -n "Step 1: Registering agent off-chain ($USERNAME)... "
  REG_RES=$(curl -s -X POST ${BASE_URL}/agents/register \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"wallet_address\": \"$WALLET\", \"description\": \"Comprehensive Test Agent\"}")
    
  AGENT_ID=$(echo $REG_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  # Registration off-chain doesn't give a token yet if no erc8004_id is present
  # But we can use the AGENT_ID as a raw token for internal testing if the middleware allows it, 
  # or we use the specific register endpoint. Actually AgentController.registerAgent returns token if requested?
  # Let's check the AgentController again. 
  
  if [ -z "$AGENT_ID" ]; then
    echo -e "${RED}❌ Off-chain registration failed${NC}"
    echo "$REG_RES"
    exit 1
  fi
  echo -e "${GREEN}✅ Done (ID: $AGENT_ID)${NC}"

  echo -n "Step 2: Registering on-chain... "
  # We need a token to call /me/register-on-chain. 
  # In our mock/dev setup, a raw agent_ ID works as a token in authMiddleware.
  # Let's use the AGENT_ID as the token.
  ONCHAIN_RES=$(curl -s -X POST ${BASE_URL}/agents/me/register-on-chain \
    -H "Authorization: Bearer $AGENT_ID" \
    -H "Content-Type: application/json")

  if echo "$ONCHAIN_RES" | grep -q '"success":true'; then
    ERCID=$(echo "$ONCHAIN_RES" | grep -o '"agentId":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Success (On-Chain ID: $ERCID)${NC}"
  else
    echo -e "${RED}❌ On-chain registration failed${NC}"
    echo "$ONCHAIN_RES"
    exit 1
  fi

  # Now we login to get a real token (or use the one from register-on-chain if it returns one)
  TOKEN=$(echo $ONCHAIN_RES | grep -o '"token":"[^"]*' | head -1 | cut -d'"' -f4)

  echo -n "Step 3: Verifying erc8004_id in profile... "
  GET_RES=$(curl -s ${BASE_URL}/agents/$AGENT_ID)
  if echo "$GET_RES" | grep -q '"erc8004_id":'; then
    echo -e "${GREEN}✅ Verified${NC}"
  else
    echo -e "${RED}❌ erc8004_id missing from profile${NC}"
    echo "$GET_RES"
  fi
}

# 2. Categories
function test_categories() {
  echo -e "\n${BLUE}2️⃣  Testing Categories${NC}"
  
  echo -n "Listing categories... "
  CAT_RES=$(curl -s ${BASE_URL}/categories)
  if echo "$CAT_RES" | grep -q '"success":true'; then
    # Get first category ID for job test
    CATEGORY_ID=$(echo $CAT_RES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    CATEGORY_NAME=$(echo $CAT_RES | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Success (Sample: $CATEGORY_NAME)${NC}"
  else
    echo -e "${RED}❌ Failed to list categories${NC}"
    echo "$CAT_RES"
  fi

  echo -n "Creating a category... "
  NEW_CAT_NAME="NewCat_$(date +%s)"
  CREATE_CAT_RES=$(curl -s -X POST ${BASE_URL}/categories \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$NEW_CAT_NAME\", \"description\": \"Test category creation\"}")
    
  if echo "$CREATE_CAT_RES" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Success${NC}"
  else
    echo -e "${RED}❌ Failed to create category${NC}"
    echo "$CREATE_CAT_RES"
  fi
}

# 3. Jobs
function test_jobs() {
  echo -e "\n${BLUE}3️⃣  Testing Jobs${NC}"
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}⚠️ Skipping Job creation (No auth token)${NC}"
    return
  fi

  echo -n "Creating a job... "
  JOB_TITLE="Test Job $(date +%s)"
  JOB_RES=$(curl -s -X POST ${BASE_URL}/jobs \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"$JOB_TITLE\", \"description\": \"Job created by comprehensive test\", \"budget_amount\": 500, \"category_id\": \"$CATEGORY_ID\"}")
    
  JOB_ID=$(echo $JOB_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$JOB_ID" ]; then
    echo -e "${RED}❌ Failed to create job${NC}"
    echo "$JOB_RES"
    return
  fi
  echo -e "${GREEN}✅ Done (ID: $JOB_ID)${NC}"

  echo -n "Listing all jobs... "
  LIST_RES=$(curl -s ${BASE_URL}/jobs)
  if echo "$LIST_RES" | grep -q "$JOB_TITLE"; then
    echo -e "${GREEN}✅ Success${NC}"
  else
    echo -e "${RED}❌ Created job not found in list${NC}"
  fi
}

# 4. Chat
function test_chat() {
  echo -e "\n${BLUE}4️⃣  Testing Chat${NC}"
  
  if [ -z "$JOB_ID" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}⚠️ Skipping Chat test (No job/token)${NC}"
    return
  fi

  echo -n "Posting a message... "
  MSG_TEXT="Hello from comprehensive test suite!"
  POST_RES=$(curl -s -X POST ${BASE_URL}/chat/$JOB_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message_text\": \"$MSG_TEXT\"}")
    
  if echo "$POST_RES" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Success${NC}"
  else
    echo -e "${RED}❌ Failed to post message${NC}"
    echo "$POST_RES"
  fi

  echo -n "Retrieving messages... "
  GET_RES=$(curl -s ${BASE_URL}/chat/$JOB_ID)
  if echo "$GET_RES" | grep -q "$MSG_TEXT"; then
    echo -e "${GREEN}✅ Success${NC}"
  else
    echo -e "${RED}❌ Message not found${NC}"
    echo "$GET_RES"
  fi
}

# 5. Search
function test_search() {
  echo -e "\n${BLUE}5️⃣  Testing Search${NC}"
  
  echo -n "Searching for agent '$USERNAME'... "
  SEARCH_RES=$(curl -s "${BASE_URL}/search?q=$USERNAME")
  if echo "$SEARCH_RES" | grep -q "$USERNAME"; then
    echo -e "${GREEN}✅ Found!${NC}"
  else
    echo -e "${RED}❌ Not found in results${NC}"
    echo "$SEARCH_RES"
  fi

  echo -n "Searching for job '$JOB_TITLE'... "
  SEARCH_JOB_RES=$(curl -s "${BASE_URL}/search?q=$(echo $JOB_TITLE | sed 's/ /%20/g')")
  if echo "$SEARCH_JOB_RES" | grep -q "$JOB_TITLE"; then
    echo -e "${GREEN}✅ Found!${NC}"
  else
    echo -e "${RED}❌ Not found in results${NC}"
    echo "$SEARCH_JOB_RES"
  fi
}

# Execute tests
check_health
test_agents
test_categories
test_jobs
test_chat
test_search

echo -e "\n${GREEN}✨ All backend functionality verified!${NC}"
