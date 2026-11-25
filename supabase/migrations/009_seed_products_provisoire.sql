-- 16 produits provisoires (sélection zip Narcisse) — idempotent sur slug
-- Visuels : /boutique/photos/*.jpg (déployés avec le site Next.js)

insert into public.products (
  name, slug, tagline, description, universe, price_cents, image_url, featured, published, sort_order
) values
  ('Sérum hydratant à l''acide hyaluronique', 'nar-sk-01', 'Réf. NAR-SK-01 — sélection provisoire', 'Sérum léger qui repulpe et hydrate, pour tous types de peau. Flacon compte-gouttes 30 ml.', 'skincare', 2900, '/boutique/photos/NAR-SK-01.jpg', true, true, 0),
  ('Crème visage nourrissante', 'nar-sk-02', 'Réf. NAR-SK-02 — sélection provisoire', 'Crème riche au fini velouté pour les peaux sèches et sensibles. Pot 50 ml.', 'skincare', 3200, '/boutique/photos/NAR-SK-02.jpg', false, true, 1),
  ('Nettoyant doux moussant', 'nar-sk-03', 'Réf. NAR-SK-03 — sélection provisoire', 'Gel nettoyant au pH doux, première étape du rituel skincare coréen. Tube 150 ml.', 'skincare', 1800, '/boutique/photos/NAR-SK-03.jpg', false, true, 2),
  ('Masques en tissu, lot de 5', 'nar-sk-04', 'Réf. NAR-SK-04 — sélection provisoire', 'Masques hydratants à usage unique pour un soin express à la maison.', 'skincare', 1500, '/boutique/photos/NAR-SK-04.jpg', false, true, 3),
  ('Gua sha en quartz rose', 'nar-sk-05', 'Réf. NAR-SK-05 — sélection provisoire', 'Pierre de massage du visage pour détendre les traits et favoriser l''éclat.', 'skincare', 2400, '/boutique/photos/NAR-SK-05.jpg', false, true, 4),
  ('Bougie parfumée en verre', 'nar-bv-01', 'Réf. NAR-BV-01 — sélection provisoire', 'Cire végétale, notes florales et boisées. Environ 40 h de combustion.', 'art-de-vivre', 2600, '/boutique/photos/NAR-BV-01.jpg', true, true, 5),
  ('Huile de massage corps', 'nar-bv-02', 'Réf. NAR-BV-02 — sélection provisoire', 'Huile sèche aux extraits végétaux pour un moment de détente. Flacon 100 ml.', 'art-de-vivre', 2200, '/boutique/photos/NAR-BV-02.jpg', false, true, 6),
  ('Brume d''oreiller apaisante', 'nar-bv-03', 'Réf. NAR-BV-03 — sélection provisoire', 'Brume parfumée à vaporiser sur le linge avant le coucher. 75 ml.', 'art-de-vivre', 1900, '/boutique/photos/NAR-BV-03.jpg', false, true, 7),
  ('Infusion bien-être', 'nar-bv-04', 'Réf. NAR-BV-04 — sélection provisoire', 'Mélange de plantes à infuser pour une pause douceur. Boîte 80 g.', 'art-de-vivre', 1200, '/boutique/photos/NAR-BV-04.jpg', false, true, 8),
  ('Carnet de gratitude', 'nar-dp-01', 'Réf. NAR-DP-01 — sélection provisoire', 'Carnet ligné à couverture rigide pour noter chaque jour ce qui fait du bien.', 'developpement', 1600, '/boutique/photos/NAR-DP-01.jpg', true, true, 9),
  ('Cartes d''affirmations', 'nar-dp-02', 'Réf. NAR-DP-02 — sélection provisoire', 'Jeu de 52 cartes positives pour commencer la journée avec intention.', 'developpement', 1900, '/boutique/photos/NAR-DP-02.jpg', false, true, 10),
  ('Journal guidé 30 jours', 'nar-dp-03', 'Réf. NAR-DP-03 — sélection provisoire', 'Un mois de questions et d''exercices pour mieux se connaître.', 'developpement', 2400, '/boutique/photos/NAR-DP-03.jpg', false, true, 11),
  ('Kit papeterie', 'nar-dp-04', 'Réf. NAR-DP-04 — sélection provisoire', 'Stylo et trois marque-pages pour accompagner carnets et journaux.', 'developpement', 1400, '/boutique/photos/NAR-DP-04.jpg', false, true, 12),
  ('Coffret rituel visage', 'nar-ed-01', 'Réf. NAR-ED-01 — sélection provisoire', 'Sélection de trois soins en format découverte, présentée en coffret.', 'editions', 6900, '/boutique/photos/NAR-ED-01.jpg', true, true, 13),
  ('Box découverte du mois', 'nar-ed-02', 'Réf. NAR-ED-02 — sélection provisoire', 'Une sélection de produits bien-être renouvelée chaque mois.', 'editions', 3900, '/boutique/photos/NAR-ED-02.jpg', false, true, 14),
  ('Carte cadeau Narcisse', 'nar-ed-03', 'Réf. NAR-ED-03 — sélection provisoire', 'À offrir pour un soin, un atelier ou un produit. Montant au choix.', 'editions', 3000, '/boutique/photos/NAR-ED-03.jpg', false, true, 15)
on conflict (slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  description = excluded.description,
  universe = excluded.universe,
  price_cents = excluded.price_cents,
  image_url = excluded.image_url,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order,
  updated_at = now();