-- 1) CONNECT auf aktuelle DB entziehen (DB-Name dynamisch)
DO $$
DECLARE db text := current_database();
BEGIN
  EXECUTE format('REVOKE CONNECT ON DATABASE %I FROM rls_tester', db);
END $$;

-- 2) Privilegien auf Schema/Tabellen/Sequenzen entziehen
REVOKE USAGE ON SCHEMA public FROM rls_tester;
REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public FROM rls_tester;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM rls_tester;

-- 3) Default-Privilegien zurücknehmen (falls gesetzt)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES    FROM rls_tester;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM rls_tester;

-- 4) Eigentum/abhängige Objekte bereinigen (falls je entstanden)
REASSIGN OWNED BY rls_tester TO postgres;
DROP OWNED BY rls_tester;

-- 5) Rolle droppen
DROP ROLE IF EXISTS rls_tester;