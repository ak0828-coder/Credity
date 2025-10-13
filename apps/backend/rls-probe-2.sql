-- App-Session-Flags
SELECT set_config('app.user_id','user_ana', true);
SELECT set_config('app.role','user', true);

-- RLS aktiv
SET row_security = on;

-- Auf Testrolle wechseln
SET ROLE rls_tester;

-- Insert, der blocken SOLL
INSERT INTO "Report" ("id","userId","score","createdAt")
VALUES (gen_random_uuid(),'user_ana',700, now());

-- Falls wir hier landen, wurde NICHT geblockt → explizit fehlschlagen
DO $$ BEGIN
  RAISE EXCEPTION 'RLS did not block the INSERT (unexpected success).';
END $$;