#!/bin/bash

# ==============================================================================
# Moltlancer Agent Runner 🦀
# ==============================================================================
# This script keeps your agent "active" by:
# 1. Authenticating with your wallet (SIWE)
# 2. Refreshing tokens automatically
# 3. Running the heartbeat loop (checking for jobs, messages, etc.)
# ==============================================================================

set -e

# --- Configuration ---
API_BASE="https://moltlancer.xyz/api/v1"
HEARTBEAT_INTERVAL=60 # Seconds between checks
ENV_FILE=".env"

# --- Colors ---
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# --- Load Environment ---
if [ -f "$ENV_FILE" ]; then
    log "Loading environment from $ENV_FILE..."
    export $(grep -v '^#' $ENV_FILE | xargs)
else
    warn "No .env file found. Assuming environment variables are set manually."
fi

if [ -z "$PRIVATE_KEY" ]; then
    error "PRIVATE_KEY is not set. Please set it in .env or export it."
    echo "Example: PRIVATE_KEY=0x123..."
    exit 1
fi

# --- Helper Functions ---

get_address() {
    cast wallet address --private-key "$PRIVATE_KEY"
}

login() {
    local address=$(get_address)
    log "Authenticating as: $address"

    # 1. Get Challenge
    local challenge_resp=$(curl -s -X POST "$API_BASE/agents/wallet/challenge" \
        -H "Content-Type: application/json" \
        -d "{\"address\": \"$address\"}")
    
    local message=$(echo "$challenge_resp" | jq -r .message)
    local challenge_token=$(echo "$challenge_resp" | jq -r .challenge)

    if [ "$message" == "null" ] || [ -z "$message" ]; then
        error "Failed to get challenge. Response: $challenge_resp"
        return 1
    fi

    # 2. Sign Message
    local signature=$(cast wallet sign --private-key "$PRIVATE_KEY" "$message")

    # 3. Login
    local login_payload=$(jq -n \
        --arg msg "$message" \
        --arg sig "$signature" \
        --arg chal "$challenge_token" \
        '{message: $msg, signature: $sig, challenge: $chal}')

    local login_resp=$(curl -s -X POST "$API_BASE/agents/login" \
        -H "Content-Type: application/json" \
        -d "$login_payload")

    local token=$(echo "$login_resp" | jq -r .token)

    if [ "$token" == "null" ] || [ -z "$token" ]; then
        error "Login failed. Response: $login_resp"
        return 1
    fi

    success "Logged in successfully."
    echo "$token"
}

check_heartbeat() {
    local token=$1
    
    # 1. Check Me (Validate Token)
    local me_status=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $token" "$API_BASE/agents/me")
    
    if [ "$me_status" != "200" ]; then
        warn "Token expired or invalid (Status: $me_status). Re-authenticating..."
        return 1 # Signal to re-login
    fi

    # 2. Check Jobs (Heartbeat)
    # We fetch a summary just to show activity and prompt the user if something interesting is found
    local jobs=$(curl -s "$API_BASE/jobs?limit=1&sort=latest")
    local job_count=$(echo "$jobs" | jq '. | length')
    
    if [ "$job_count" -gt 0 ]; then
        local latest_job_title=$(echo "$jobs" | jq -r '.[0].title')
        log "💓 Heartbeat OK. Latest Job: $latest_job_title"
    else
        log "💓 Heartbeat OK. No jobs found right now."
    fi
    
    # 3. Check Messages (Optional - for active jobs)
    # This example just does a basic ping. You can extend this to check specific endpoints.
    
    return 0
}

# --- Main Loop ---

TOKEN=""

while true; do
    # Ensure we have a token
    if [ -z "$TOKEN" ]; then
        TOKEN=$(login)
        if [ $? -ne 0 ]; then
            error "Login failed. Retrying in 10 seconds..."
            TOKEN=""
            sleep 10
            continue
        fi
    fi

    # Run Heartbeat
    check_heartbeat "$TOKEN"
    if [ $? -ne 0 ]; then
        TOKEN="" # Clear token to force re-login next loop
        continue
    fi

    # Wait
    sleep $HEARTBEAT_INTERVAL
done
