-- Safety: Funktion für UUID-Defaults (Railway hat meist pgcrypto schon aktiv)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Deny-by-default: Public-Zugriff entfernen
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- RLS aktivieren & erzwingen
ALTER TABLE "Profile"   ENABLE ROW LEVEL SECURITY; ALTER TABLE "Profile"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "Consent"   ENABLE ROW LEVEL SECURITY; ALTER TABLE "Consent"   FORCE ROW LEVEL SECURITY;
ALTER TABLE "Report"    ENABLE ROW LEVEL SECURITY; ALTER TABLE "Report"    FORCE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"  ENABLE ROW LEVEL SECURITY; ALTER TABLE "AuditLog"  FORCE ROW LEVEL SECURITY;
ALTER TABLE "Job"       ENABLE ROW LEVEL SECURITY; ALTER TABLE "Job"       FORCE ROW LEVEL SECURITY;

-- Policies nutzen Session-Settings: app.user_id (text) und app.role ('user'|'service')
-- Profile: Owner lesen/ändern/löschen, Service darf alles (z.B. Admin/Worker)
DROP POLICY IF EXISTS profile_owner_select ON "Profile";
CREATE POLICY profile_owner_select ON "Profile"
  FOR SELECT USING ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS profile_owner_update ON "Profile";
CREATE POLICY profile_owner_update ON "Profile"
  FOR UPDATE USING ("userId" = current_setting('app.user_id', true))
            WITH CHECK ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS profile_owner_delete ON "Profile";
CREATE POLICY profile_owner_delete ON "Profile"
  FOR DELETE USING ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS profile_service_all ON "Profile";
CREATE POLICY profile_service_all ON "Profile"
  FOR ALL USING (current_setting('app.role', true) = 'service')
  WITH CHECK (current_setting('app.role', true) = 'service');

-- Consents: Owner read/insert/update (nur für eigene userId)
DROP POLICY IF EXISTS consent_owner_select ON "Consent";
CREATE POLICY consent_owner_select ON "Consent"
  FOR SELECT USING ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS consent_owner_insert ON "Consent";
CREATE POLICY consent_owner_insert ON "Consent"
  FOR INSERT WITH CHECK ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS consent_owner_update ON "Consent";
CREATE POLICY consent_owner_update ON "Consent"
  FOR UPDATE USING ("userId" = current_setting('app.user_id', true))
            WITH CHECK ("userId" = current_setting('app.user_id', true));

-- Reports: Owner lesen, Service (Scoring-Worker) darf schreiben
DROP POLICY IF EXISTS report_owner_select ON "Report";
CREATE POLICY report_owner_select ON "Report"
  FOR SELECT USING ("userId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS report_service_insert ON "Report";
CREATE POLICY report_service_insert ON "Report"
  FOR INSERT WITH CHECK (current_setting('app.role', true) = 'service');

-- AuditLog: Owner darf seine eigenen Logs sehen; Service schreibt
DROP POLICY IF EXISTS audit_owner_select ON "AuditLog";
CREATE POLICY audit_owner_select ON "AuditLog"
  FOR SELECT USING ("actorUserId" = current_setting('app.user_id', true));

DROP POLICY IF EXISTS audit_service_insert ON "AuditLog";
CREATE POLICY audit_service_insert ON "AuditLog"
  FOR INSERT WITH CHECK (current_setting('app.role', true) = 'service');

-- Jobs: nur Service (Worker/API) hat Zugriff
DROP POLICY IF EXISTS job_service_all ON "Job";
CREATE POLICY job_service_all ON "Job"
  FOR ALL USING (current_setting('app.role', true) = 'service')
  WITH CHECK (current_setting('app.role', true) = 'service');