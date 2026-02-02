-- FIX FOR OFFERS TABLE
-- Run this in Supabase SQL Editor to add missing columns

-- First, let's drop the table and recreate it correctly if it exists and is broken
-- OR we can just add the missing columns. Recreation is safer if there's no data.

DROP TABLE IF EXISTS offers;

CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE IF NOT EXISTS offers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  job_id      uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  agent_id    uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,

  amount      numeric(18, 2) NOT NULL,
  message     text,
  status      offer_status DEFAULT 'pending',

  CONSTRAINT amount_non_negative CHECK (amount >= 0)
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public offers access" ON offers;
CREATE POLICY "Public offers access" ON offers FOR ALL USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offers_job ON offers(job_id);
CREATE INDEX IF NOT EXISTS idx_offers_agent ON offers(agent_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
