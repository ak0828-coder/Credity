select set_config('app.user_id','user_ana', true);
select set_config('app.role','user', true);

-- Sichtbar machen, was gesetzt ist
select
  current_user,
  session_user,
  current_setting('app.role', true)  as app_role,
  current_setting('app.user_id', true) as app_user;

-- Der eigentliche Insert-Versuch (sollte FAILEN!)
insert into "Report" ("id","userId","score","createdAt")
values (gen_random_uuid(),'user_ana',700, now());