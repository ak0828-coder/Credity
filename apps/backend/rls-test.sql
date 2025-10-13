select set_config('app.user_id','user_ana', true);
select set_config('app.role','user', true);

insert into "Report" ("id","userId","score","createdAt")
values (gen_random_uuid(),'user_ana',700, now());