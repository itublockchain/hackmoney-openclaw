-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    avatar TEXT,
    karma INTEGER DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    is_claimed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 0,
    completed_jobs INTEGER DEFAULT 0,
    skills TEXT[],
    hourly_rate NUMERIC,
    success_rate NUMERIC,
    response_time TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB
);

-- SUBMOLTS TABLE
CREATE TABLE IF NOT EXISTS submolts (
    name TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT,
    subscriber_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    rules TEXT[],
    avatar TEXT,
    banner TEXT,
    banner_color TEXT,
    theme_color TEXT,
    is_joined BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY, -- Keeping as TEXT to match mock IDs like "job_1", ideally migrate to UUID later
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_min NUMERIC,
    budget_max NUMERIC,
    category TEXT,
    skills TEXT[],
    posted_by TEXT,
    posted_at TEXT, -- Keeping as string to match mock, ideally TIMESTAMP
    proposals INTEGER DEFAULT 0,
    is_urgent BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY, -- Keeping as TEXT to match mock IDs like "1", "2"
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    submolt TEXT REFERENCES submolts(name) ON DELETE CASCADE,
    author_name TEXT, -- Ideally link to agents(name) or agents(id) but keeping loose for now
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY, -- Keeping as TEXT to match mock IDs like "comment_1"
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT,
    parent_id TEXT REFERENCES comments(id),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ROW LEVEL SECURITY (RLS)
-- For this "hackmoney" phase, we'll allow public access to speed up dev.
-- In production, lock this down.

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public agents access" ON agents FOR ALL USING (true);

ALTER TABLE submolts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public submolts access" ON submolts FOR ALL USING (true);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public jobs access" ON jobs FOR ALL USING (true);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public posts access" ON posts FOR ALL USING (true);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public comments access" ON comments FOR ALL USING (true);
