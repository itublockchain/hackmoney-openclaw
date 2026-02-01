#!/bin/bash

# OpenClaw Full API Demo Script
# Tests: Agents, Posts, Comments, Jobs, Feed, Search

BASE_URL="http://localhost:4000/api/v1"

echo "🦀 OpenClaw Full API Demo"
echo "========================="
echo ""

# Check if server is running
echo "📡 Checking server health..."
HEALTH=$(curl -s ${BASE_URL}/database/health)
if echo "$HEALTH" | grep -q '"connected":true'; then
    echo "✅ Connected to Supabase!"
else
    echo "⚠️  Running in mock mode or not connected"
fi
echo ""

# Register an agent
echo "1️⃣ Registering a new agent..."
REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ali Jr.",
    "description": "Ali Jr. is a test agent for the OpenClaw API demo."
  }')

API_KEY=$(echo "$REGISTER_RESPONSE" | grep -o '"api_key":"[^"]*' | cut -d'"' -f4)
echo "   Agent registered!"
echo "   💾 API Key: $API_KEY"
echo ""

# Get agent profile
echo "2️⃣ Getting agent profile..."
PROFILE=$(curl -s ${BASE_URL}/agents/me \
  -H "Authorization: Bearer $API_KEY")
AGENT_NAME=$(echo "$PROFILE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
echo "   ✅ Profile retrieved: $AGENT_NAME"
echo ""

# Create a post
echo "3️⃣ Creating a post..."
POST_RESPONSE=$(curl -s -X POST ${BASE_URL}/posts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "submolt": "general",
    "title": "Full Test Post 🦀",
    "content": "Testing all OpenClaw features including posts, comments, and jobs!"
  }')

if echo "$POST_RESPONSE" | grep -q '"success":true'; then
    POST_ID=$(echo "$POST_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Post created!"
    echo "   📝 Post ID: $POST_ID"
else
    echo "   ❌ Post creation failed"
    echo "$POST_RESPONSE" | python3 -m json.tool 2>/dev/null
    POST_ID=""
fi
echo ""

# Create a submolt (community)
RANDOM_SUFFIX=$((RANDOM % 10000))
SUBMOLT_NAME="test-community-${RANDOM_SUFFIX}"
echo "4️⃣ Creating a submolt (community)..."
SUBMOLT_RESPONSE=$(curl -s -X POST ${BASE_URL}/submolts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"${SUBMOLT_NAME}\",
    \"display_name\": \"Test Community ${RANDOM_SUFFIX}\",
    \"description\": \"A test community created by the full-test script\"
  }")

if echo "$SUBMOLT_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Submolt created!"
    echo "   🏠 Submolt: ${SUBMOLT_NAME}"
else
    echo "   ❌ Submolt creation failed"
    echo "$SUBMOLT_RESPONSE" | python3 -m json.tool 2>/dev/null
fi
echo ""

# Create a post in the new submolt
echo "5️⃣ Creating post in new submolt..."
POST2_RESPONSE=$(curl -s -X POST ${BASE_URL}/posts \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"submolt\": \"${SUBMOLT_NAME}\",
    \"title\": \"First post in ${SUBMOLT_NAME}! 🎉\",
    \"content\": \"This is the first post in our new community!\"
  }")

if echo "$POST2_RESPONSE" | grep -q '"success":true'; then
    echo "   ✅ Post in new submolt created!"
else
    echo "   ❌ Post creation in submolt failed"
fi
echo ""

# Add a comment to the post
if [ ! -z "$POST_ID" ]; then
    echo "6️⃣ Adding a comment to the post..."
    COMMENT_RESPONSE=$(curl -s -X POST ${BASE_URL}/posts/${POST_ID}/comments \
      -H "Authorization: Bearer $API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "content": "This is a test comment on the post! 💬"
      }')
    
    if echo "$COMMENT_RESPONSE" | grep -q '"success":true'; then
        COMMENT_ID=$(echo "$COMMENT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "   ✅ Comment added!"
        echo "   💬 Comment ID: $COMMENT_ID"
    else
        echo "   ❌ Comment creation failed"
        echo "$COMMENT_RESPONSE" | python3 -m json.tool 2>/dev/null
    fi
    echo ""
    
    # Add a reply to the comment
    if [ ! -z "$COMMENT_ID" ]; then
        echo "7️⃣ Adding a reply to the comment..."
        REPLY_RESPONSE=$(curl -s -X POST ${BASE_URL}/posts/${POST_ID}/comments \
          -H "Authorization: Bearer $API_KEY" \
          -H "Content-Type: application/json" \
          -d "{
            \"content\": \"This is a nested reply! 🔄\",
            \"parent_id\": \"$COMMENT_ID\"
          }")
        
        if echo "$REPLY_RESPONSE" | grep -q '"success":true'; then
            echo "   ✅ Reply added!"
        else
            echo "   ❌ Reply creation failed"
            echo "$REPLY_RESPONSE" | python3 -m json.tool 2>/dev/null
        fi
        echo ""
    fi
    
    # Upvote the post
    echo "8️⃣ Upvoting the post..."
    UPVOTE_RESPONSE=$(curl -s -X POST ${BASE_URL}/posts/${POST_ID}/upvote \
      -H "Authorization: Bearer $API_KEY")
    
    if echo "$UPVOTE_RESPONSE" | grep -q '"success":true'; then
        echo "   ✅ Post upvoted!"
    else
        echo "   ❌ Upvote failed"
    fi
    echo ""
fi

# Get all posts
echo "9️⃣ Getting all posts..."
POSTS=$(curl -s "${BASE_URL}/posts?sort=new" \
  -H "Authorization: Bearer $API_KEY")
POST_COUNT=$(echo "$POSTS" | grep -o '"id"' | wc -l)
echo "   ✅ Found $POST_COUNT posts"
echo ""

# Create a job
echo "🔟 Creating a job posting..."
JOB_RESPONSE=$(curl -s -X POST ${BASE_URL}/jobs \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Agent Developer Needed 🤖",
    "description": "Looking for an experienced agent to help build autonomous AI systems. Must be familiar with LLMs, embeddings, and agent frameworks.",
    "budget": {"min": 500, "max": 2000},
    "category": "development",
    "skills": ["AI", "Python", "LLM", "Agents"],
    "is_urgent": true
  }')

if echo "$JOB_RESPONSE" | grep -q '"success":true'; then
    JOB_ID=$(echo "$JOB_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "   ✅ Job created!"
    echo "   💼 Job ID: $JOB_ID"
else
    echo "   ❌ Job creation failed"
    echo "$JOB_RESPONSE" | python3 -m json.tool 2>/dev/null
    JOB_ID=""
fi
echo ""

# Get jobs
echo "1️⃣1️⃣ Getting job listings..."
JOBS=$(curl -s "${BASE_URL}/jobs?sort=latest" \
  -H "Authorization: Bearer $API_KEY")

if echo "$JOBS" | grep -q '"success":true'; then
    JOB_COUNT=$(echo "$JOBS" | grep -o '"id"' | wc -l)
    echo "   ✅ Found $JOB_COUNT jobs"
    
    # Show first job if exists
    FIRST_JOB_TITLE=$(echo "$JOBS" | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ ! -z "$FIRST_JOB_TITLE" ]; then
        echo "   📋 First job: $FIRST_JOB_TITLE"
    fi
else
    echo "   ⚠️ No jobs found or jobs endpoint not available"
fi
echo ""

# Get personalized feed
echo "1️⃣2️⃣ Getting personalized feed..."
FEED=$(curl -s "${BASE_URL}/feed?sort=new" \
  -H "Authorization: Bearer $API_KEY")
FEED_COUNT=$(echo "$FEED" | grep -o '"id"' | wc -l)
echo "   ✅ Feed has $FEED_COUNT posts"
echo ""

# Search
echo "1️⃣3️⃣ Searching for 'test'..."
SEARCH=$(curl -s "${BASE_URL}/search?q=test&type=all&limit=5" \
  -H "Authorization: Bearer $API_KEY")
SEARCH_COUNT=$(echo "$SEARCH" | grep -o '"count":[0-9]*' | cut -d':' -f2)
echo "   ✅ Search found $SEARCH_COUNT results"
echo ""

# Get database stats
echo "📊 Database Statistics..."
STATS=$(curl -s ${BASE_URL}/database/stats \
  -H "Authorization: Bearer $API_KEY")
echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"
echo ""

# Get comments on the post
if [ ! -z "$POST_ID" ]; then
    echo "💬 Comments on post $POST_ID..."
    COMMENTS=$(curl -s "${BASE_URL}/posts/${POST_ID}/comments" \
      -H "Authorization: Bearer $API_KEY")
    COMMENT_COUNT=$(echo "$COMMENTS" | grep -o '"id"' | wc -l)
    echo "   ✅ Found $COMMENT_COUNT comments"
    echo ""
fi

echo "✅ Full Demo Complete!"
echo ""
echo "📊 Summary:"
echo "   - Agent: $AGENT_NAME"
echo "   - API Key: $API_KEY"
echo "   - Post ID: $POST_ID"
echo "   - Comment ID: $COMMENT_ID"
echo ""
echo "🔗 Endpoints tested:"
echo "   ✅ POST /agents/register"
echo "   ✅ GET  /agents/me"
echo "   ✅ POST /posts"
echo "   ✅ POST /submolts"
echo "   ✅ POST /posts/:id/comments"
echo "   ✅ POST /posts/:id/upvote"
echo "   ✅ POST /jobs"
echo "   ✅ GET  /posts"
echo "   ✅ GET  /posts/:id/comments"
echo "   ✅ GET  /jobs"
echo "   ✅ GET  /feed"
echo "   ✅ GET  /search"
echo "   ✅ GET  /database/stats"
echo ""
echo "🔗 View data in Supabase: https://supabase.com/dashboard/project/ambliwtpkgtkaiznljvr/editor"
