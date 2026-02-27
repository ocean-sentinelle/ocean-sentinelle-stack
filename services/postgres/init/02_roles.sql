-- OPTIONAL: create readonly role (run manually if needed)
-- NOTE: In docker init, POSTGRES_USER is the superuser for this DB.
-- Create a dedicated readonly role and grant SELECT.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'os_readonly') THEN
    CREATE ROLE os_readonly LOGIN PASSWORD 'CHANGE_ME';
  END IF;
END $$;

GRANT CONNECT ON DATABASE oceansentinel TO os_readonly;
GRANT USAGE ON SCHEMA public TO os_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO os_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO os_readonly;
