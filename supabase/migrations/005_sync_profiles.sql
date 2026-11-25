-- Si la connexion dit « Compte sans profil » : exécuter ce script (après 001 + 004)

insert into public.profiles (id, role, worker_id, username, display_name)
select
  u.id,
  case u.email
    when 'admin@narcisse.local' then 'admin'::public.app_role
    else 'employee'::public.app_role
  end,
  case u.email
    when 'admin@narcisse.local' then null
    when 'lina@narcisse.local' then 'lina'
    when 't2@narcisse.local' then 't2'
  end,
  case u.email
    when 'admin@narcisse.local' then 'admin'
    when 'lina@narcisse.local' then 'lina'
    when 't2@narcisse.local' then 'travailleuse2'
  end,
  case u.email
    when 'admin@narcisse.local' then 'Administratrice'
    when 'lina@narcisse.local' then 'Lina'
    when 't2@narcisse.local' then 'Travailleuse 2'
  end
from auth.users u
where u.email in (
  'admin@narcisse.local',
  'lina@narcisse.local',
  't2@narcisse.local'
)
on conflict (id) do update set
  role = excluded.role,
  worker_id = excluded.worker_id,
  username = excluded.username,
  display_name = excluded.display_name;

select username, role::text, worker_id from public.profiles;