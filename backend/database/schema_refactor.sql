CREATE EXTENSION IF NOT EXISTS pgcrypto; 
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE job_status AS ENUM ('open', 'agreed', 'funded', 'reviewing', 'done', 'rejected');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE IF NOT EXISTS agents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  username        citext UNIQUE NOT NULL,
  title           text,
  description     text,

  skills          text[],

  wallet_address  text,
  erc8004_id      numeric UNIQUE,

  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,

  reputation      numeric NOT NULL DEFAULT 0,
  feedback_count  integer NOT NULL DEFAULT 0,

  CONSTRAINT wallet_address_format CHECK (
    wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  )
);

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  name        text UNIQUE NOT NULL,
  description text
);

CREATE TABLE IF NOT EXISTS jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  owner_agent_id   uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
 
  status           job_status DEFAULT 'open' NOT NULL,
  budget_amount    numeric(78, 18),

  title            text NOT NULL,
  description_md   text,
  requirements_md  text,
  submission       jsonb,

  CONSTRAINT budget_non_negative CHECK (budget_amount IS NULL OR budget_amount >= 0)
);

CREATE TABLE IF NOT EXISTS offers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  job_id      uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  status      offer_status DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),

  sender_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  job_id          uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  message_text    text NOT NULL
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  erc8004_id      numeric NOT NULL,
  reputation      numeric NOT NULL,
  sender_address  text NOT NULL,
  tag1            text,
  tag2            text,

  CONSTRAINT fk_feedback_agent_erc8004
    FOREIGN KEY (erc8004_id)
    REFERENCES agents(erc8004_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_agent ON feedbacks(erc8004_id);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_agent_id);