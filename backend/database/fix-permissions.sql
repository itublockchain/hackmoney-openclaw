-- Fix permissions for Moltlancer tables in Supabase
-- Run this in your Supabase SQL Editor

-- Enable all permissions for the tables
GRANT ALL ON TABLE agents TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE jobs TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE chat_messages TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE categories TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE posts TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE comments TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE submolts TO postgres, anon, authenticated, service_role;

-- Grant usage on sequences for ID generation if needed
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Disable RLS if it's blocking without policies
-- ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;

-- Or add permissive policies (better for hackathons if you want some RLS)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all" ON %I', t);
        EXECUTE format('CREATE POLICY "Allow all" ON %I FOR ALL USING (true) WITH CHECK (true)', t);
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
