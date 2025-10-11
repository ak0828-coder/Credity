-- Session-Settings (setzen wir NICHT fürs Diagnostik-Reading)
select
  current_user,
  session_user,
  current_setting('app.role', true)  as app_role,
  current_setting('app.user_id', true) as app_user;

-- Hat die aktuelle DB-Rolle BYPASSRLS?
select rolname, rolbypassrls
from pg_roles
where rolname = current_user;

-- Ist RLS & FORCE auf "Report" aktiv?
select c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'Report' and n.nspname = 'public';

-- Welche Policies sind auf "Report" definiert?
select p.polname, p.polcmd, p.polpermissive,
       pg_get_expr(p.polqual, p.polrelid)      as using_expr,
       pg_get_expr(p.polwithcheck, p.polrelid) as withcheck_expr
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where c.relname = 'Report' and n.nspname = 'public';