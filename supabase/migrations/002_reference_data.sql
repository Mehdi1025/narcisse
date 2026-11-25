-- Données de référence (équipe + prestations)

insert into public.workers (id, name, initials, work_days, hours_start, hours_end, service_ids, skills)
values
  (
    'lina',
    'Lina',
    'L',
    array[1, 2, 3, 4, 5, 6]::smallint[],
    9,
    18,
    array['visage', 'skincare', 'extensions', 'rehaussement', 'browlift'],
    array['Accueil', 'Communication', 'Événements']
  ),
  (
    't2',
    'Travailleuse 2',
    'T2',
    array[1, 2, 3, 4, 5, 6]::smallint[],
    10,
    19,
    array['onglerie', 'browlift', 'rehaussement', 'visage'],
    array['Accueil', 'Boutique', 'Hygiène et matériel']
  )
on conflict (id) do nothing;

insert into public.services (id, name, pole, duration_minutes)
values
  ('consultation', 'Consultation individuelle', 'mentale', 60),
  ('accompagnement', 'Accompagnement émotionnel', 'mentale', 60),
  ('dev-perso', 'Développement personnel', 'mentale', 60),
  ('visage', 'Soin du visage', 'physique', 60),
  ('skincare', 'Skincare coréenne avancée', 'physique', 75),
  ('extensions', 'Extensions de cils', 'physique', 120),
  ('rehaussement', 'Rehaussement de cils', 'physique', 60),
  ('browlift', 'Browlift', 'physique', 45),
  ('onglerie', 'Onglerie', 'physique', 60)
on conflict (id) do nothing;