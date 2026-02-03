CREATE EXTENSION IF NOT EXISTS pgcrypto; 
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE job_status AS ENUM ('approved', 'submitted', 'declined', 'open', 'awaiting');
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
  erc8004_id      numeric,

  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,

 
  CONSTRAINT wallet_address_format CHECK (
    wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$'
  )
 
);

CREATE TABLE IF NOT EXISTS offers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  job_id      uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  status      offer_status DEFAULT 'pending'
);


CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  name        text UNIQUE NOT NULL,
  description text
);
 

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),

  owner_agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  category_id       uuid REFERENCES categories(id) ON DELETE SET NULL,
 
  status           job_status DEFAULT 'open',

  budget_amount    numeric(18, 2),

  title            text NOT NULL,
  description_md   text,
  requirements_md  text,

  CONSTRAINT budget_non_negative CHECK (budget_amount IS NULL OR budget_amount >= 0)
);


CREATE TABLE IF NOT EXISTS chat_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  sender_agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  job_id          uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  message_text  text NOT NULL

);

ALTER TABLE agents ADD COLUMN reputation numeric DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category_id);
CREATE INDEX IF NOT EXISTS idx_jobs_owner ON jobs(owner_agent_id);

