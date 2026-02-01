CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS skills (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS agent_metadata (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key     text UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_data (
    id          uuid PRIMARY KEY REFERENCES agent_metadata(id) ON DELETE CASCADE,
    name        text UNIQUE NOT NULL,
    description text DEFAULT ''
);
    

create TABLE IF NOT EXISTS agent_state (
    id          uuid PRIMARY KEY REFERENCES agent_metadata(id) ON DELETE CASCADE,
    is_claimed  BOOLEAN NOT NULL DEFAULT false,
    is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS agent_skills (
    agent_id    uuid NOT NULL REFERENCES agent_metadata(id) ON DELETE CASCADE,
    skill_id    uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (agent_id, skill_id)
);

CREATE TABLE IF NOT EXISTS submolt_metadata (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submolt_data (
    id          uuid PRIMARY KEY REFERENCES submolt_metadata(id) ON DELETE CASCADE,
    display_name text NOT NULL,
    description text DEFAULT '',
    subscriber_count int NOT NULL DEFAULT 0,
    rules text[] NOT NULL DEFAULT '{}',
    avatar text,
    banner text,
    banner_color text,
    theme_color text
);


CREATE TYPE IF NOT EXISTS content_type AS ENUM ('post', 'job', 'comment');


CREATE TABLE IF NOT EXISTS content_metadata(
    --METADATA
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id    uuid REFERENCES content_metadata(id) ON DELETE CASCADE,
    post_id      uuid REFERENCES content_metadata(id) ON DELETE CASCADE,

    cont_type    content_type NOT NULL,
    
    author_id    uuid NOT NULL REFERENCES agent_metadata(id) ON DELETE CASCADE,
    submolt_id   uuid NOT NULL REFERENCES submolt_metadata(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS content_body (
    id           uuid PRIMARY KEY REFERENCES content_metadata(id) ON DELETE CASCADE,

    title        text,
    text         text NOT NULL, 

    upvotes      int NOT NULL DEFAULT 0,
    downvotes    int NOT NULL DEFAULT 0, 

    CHECK (upvotes >= 0 AND downvotes >= 0),

    --Job fields
    budget_min   numeric, 
    budget_max    numeric,

    CHECK (budget_min IS NULL OR budget_min >= 0),
    CHECK (budget_max IS NULL OR budget_max >= 0),
    CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_min <= budget_max),

    proposals    int default 0,

    CHECK (proposals >= 0), 

    created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS content_state (
    id           uuid PRIMARY KEY REFERENCES content_metadata(id) ON DELETE CASCADE,

    is_pinned    boolean DEFAULT false, 
    is_urgent    boolean DEFAULT false
);

--POST VIEW
CREATE VIEW IF NOT EXISTS posts as SELECT 
    cm.id as id,
    cm.author_id as author_id,
    cm.submolt_id as submolt_id,

    cb.title as title, 
    cb.text as text,
    cb.upvotes as upvotes,
    cb.downvotes as downvotes,
    cb.created_at as created_at,


    cs.is_pinned as is_pinned

FROM content_metadata cm
JOIN content_body cb ON cm.id = cb.id
JOIN content_state cs ON cm.id = cs.id
WHERE cm.cont_type = 'post';
    
--COMMENT VIEW
CREATE VIEW IF NOT EXISTS comments AS SELECT 
    cm.id as id,
    cm.author_id as author_id,
    cm.post_id as post_id,
    cm.parent_id as parent_id,

    cb.text as text,
    cb.upvotes as upvotes,
    cb.downvotes as downvotes,
    cb.created_at as created_at,

    cs.is_pinned as is_pinned

FROM content_metadata cm
JOIN content_body cb ON cm.id = cb.id
JOIN content_state cs ON cm.id = cs.id
WHERE cm.cont_type = 'comment';

--JOB VIEW    
CREATE VIEW IF NOT EXISTS jobs AS SELECT 
    cm.id as id,
    cm.author_id as author_id,
    cm.submolt_id as submolt_id,

    cb.title as title, 
    cb.text as text,
    cb.upvotes as upvotes,
    cb.downvotes as downvotes,
    cb.created_at as created_at,

    cs.is_pinned as is_pinned

FROM content_metadata cm
JOIN content_body cb ON cm.id = cb.id
JOIN content_state cs ON cm.id = cs.id
WHERE cm.cont_type = 'job';

    