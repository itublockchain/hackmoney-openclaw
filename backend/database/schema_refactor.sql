CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--===========================
--Tables
--===========================

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


--=================================
--Indexes
--=================================
--Agent
CREATE INDEX IF NOT EXISTS idx_agent_skills_agent_id ON agent_skills(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_skills_skill_id ON agent_skills(skill_id);

--Submolt
CREATE INDEX IF NOT EXISTS idx_submolt_metadata_name ON submolt_metadata(name);
CREATE INDEX IF NOT EXISTS idx_submolt_metadata_created_at ON submolt_metadata(created_at);

CREATE INDEX IF NOT EXISTS idx_submolt_data_display_name ON submolt_data(display_name);
CREATE INDEX IF NOT EXISTS idx_submolt_data_subscriber_count ON submolt_data(subscriber_count);

--Content Metadata
CREATE INDEX IF NOT EXISTS idx_content_metadata_parent_id ON content_metadata(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_post_id ON content_metadata(post_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_cont_type ON content_metadata(cont_type);
CREATE INDEX IF NOT EXISTS idx_content_metadata_author_id ON content_metadata(author_id);
CREATE INDEX IF NOT EXISTS idx_content_metadata_submolt_id ON content_metadata(submolt_id);

--Content Body
CREATE INDEX IF NOT EXISTS idx_content_body_title ON content_body(title);
CREATE INDEX IF NOT EXISTS idx_content_body_text ON content_body(text);
CREATE INDEX IF NOT EXISTS idx_content_body_upvotes ON content_body(upvotes);
CREATE INDEX IF NOT EXISTS idx_content_body_downvotes ON content_body(downvotes);
CREATE INDEX IF NOT EXISTS idx_content_body_budget_min ON content_body(budget_min);
CREATE INDEX IF NOT EXISTS idx_content_body_budget_max ON content_body(budget_max);
CREATE INDEX IF NOT EXISTS idx_content_body_proposals ON content_body(proposals);
CREATE INDEX IF NOT EXISTS idx_content_body_created_at ON content_body(created_at);


--Content State
CREATE INDEX IF NOT EXISTS idx_content_state_is_pinned ON content_state(is_pinned);
CREATE INDEX IF NOT EXISTS idx_content_state_is_urgent ON content_state(is_urgent);


--Optional

CREATE INDEX IF NOT EXISTS idx_cb_upvote_desc ON content_body(upvotes DESC);


CREATE INDEX IF NOT EXISTS idx_cb_budget_min ON content_body(budget_min);
CREATE INDEX IF NOT EXISTS idx_cb_budget_max ON content_body(budget_max);


--POST VIEW
CREATE OR REPLACE VIEW posts as SELECT 
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
CREATE OR REPLACE VIEW comments AS SELECT 
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
CREATE OR REPLACE VIEW jobs AS SELECT 
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

    