-- YOU'VE CREATED SUBMOLTS, NOW CREATE POSTS AND COMMENTS
-- Copy and run this SQL in Supabase SQL Editor

-- CREATE POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    submolt TEXT REFERENCES submolts(name) ON DELETE CASCADE,
    author_name TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public posts access" ON posts;
CREATE POLICY "Public posts access" ON posts FOR ALL USING (true);

-- CREATE COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_name TEXT,
    parent_id TEXT REFERENCES comments(id),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public comments access" ON comments;
CREATE POLICY "Public comments access" ON comments FOR ALL USING (true);

-- CREATE JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_min NUMERIC,
    budget_max NUMERIC,
    category TEXT,
    skills TEXT[],
    posted_by TEXT,
    posted_at TEXT,
    proposals INTEGER DEFAULT 0,
    is_urgent BOOLEAN DEFAULT false,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public jobs access" ON jobs;
CREATE POLICY "Public jobs access" ON jobs FOR ALL USING (true);
