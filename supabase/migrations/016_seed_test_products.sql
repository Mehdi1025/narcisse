-- Jeu de test : 16 produits provisoires publiés, prix TTC et stock pour la boutique en ligne.
-- Prérequis : 008_products, 014_shop_orders, 015_products_stock déjà appliqués.

insert into public.products (
  name,
  slug,
  tagline,
  description,
  universe,
  price_cents,
  image_url,
  featured,
  published,
  sort_order,
  stock_on_hand,
  stock_reserved,
  stock_alert_threshold
) values
  ('Sérum hydratant à l''acide hyaluronique', 'nar-sk-01', 'Réf. NAR-SK-01', 'Sérum léger qui repulpe et hydrate, pour tous types de peau. Flacon compte-gouttes 30 ml.', 'skincare', 2900, '/boutique/photos/NAR-SK-01.jpg', true, true, 0, 25, 0, 3),
  ('Crème visage nourrissante', 'nar-sk-02', 'Réf. NAR-SK-02', 'Crème riche au fini velouté pour les peaux sèches et sensibles. Pot 50 ml.', 'skincare', 3200, '/boutique/photos/NAR-SK-02.jpg', false, true, 1, 25, 0, 3),
  ('Nettoyant doux moussant', 'nar-sk-03', 'Réf. NAR-SK-03', 'Gel nettoyant au pH doux, première étape du rituel skincare coréen. Tube 150 ml.', 'skincare', 1800, '/boutique/photos/NAR-SK-03.jpg', false, true, 2, 25, 0, 3),
  ('Masques en tissu, lot de 5', 'nar-sk-04', 'Réf. NAR-SK-04', 'Masques hydratants à usage unique pour un soin express à la maison.', 'skincare', 1500, '/boutique/photos/NAR-SK-04.jpg', false, true, 3, 25, 0, 3),
  ('Gua sha en quartz rose', 'nar-sk-05', 'Réf. NAR-SK-05', 'Pierre de massage du visage pour détendre les traits et favoriser l''éclat.', 'skincare', 2400, '/boutique/photos/NAR-SK-05.jpg', false, true, 4, 25, 0, 3),
  ('Bougie parfumée en verre', 'nar-bv-01', 'Réf. NAR-BV-01', 'Cire végétale, notes florales et boisées. Environ 40 h de combustion.', 'art-de-vivre', 2600, '/boutique/photos/NAR-BV-01.jpg', true, true, 5, 25, 0, 3),
  ('Huile de massage corps', 'nar-bv-02', 'Réf. NAR-BV-02', 'Huile sèche aux extraits végétaux pour un moment de détente. Flacon 100 ml.', 'art-de-vivre', 2200, '/boutique/photos/NAR-BV-02.jpg', false, true, 6, 25, 0, 3),
  ('Brume d''oreiller apaisante', 'nar-bv-03', 'Réf. NAR-BV-03', 'Brume parfumée à vaporiser sur le linge avant le coucher. 75 ml.', 'art-de-vivre', 1900, '/boutique/photos/NAR-BV-03.jpg', false, true, 7, 25, 0, 3),
  ('Infusion bien-être', 'nar-bv-04', 'Réf. NAR-BV-04', 'Mélange de plantes à infuser pour une pause douceur. Boîte 80 g.', 'art-de-vivre', 1200, '/boutique/photos/NAR-BV-04.jpg', false, true, 8, 25, 0, 3),
  ('Carnet de gratitude', 'nar-dp-01', 'Réf. NAR-DP-01', 'Carnet ligné à couverture rigide pour noter chaque jour ce qui fait du bien.', 'developpement', 1600, '/boutique/photos/NAR-DP-01.jpg', true, true, 9, 25, 0, 3),
  ('Cartes d''affirmations', 'nar-dp-02', 'Réf. NAR-DP-02', 'Jeu de 52 cartes positives pour commencer la journée avec intention.', 'developpement', 1900, '/boutique/photos/NAR-DP-02.jpg', false, true, 10, 25, 0, 3),
  ('Journal guidé 30 jours', 'nar-dp-03', 'Réf. NAR-DP-03', 'Un mois de questions et d''exercices pour mieux se connaître.', 'developpement', 2400, '/boutique/photos/NAR-DP-03.jpg', false, true, 11, 25, 0, 3),
  ('Kit papeterie', 'nar-dp-04', 'Réf. NAR-DP-04', 'Stylo et trois marque-pages pour accompagner carnets et journaux.', 'developpement', 1400, '/boutique/photos/NAR-DP-04.jpg', false, true, 12, 25, 0, 3),
  ('Coffret rituel visage', 'nar-ed-01', 'Réf. NAR-ED-01', 'Sélection de trois soins en format découverte, présentée en coffret.', 'editions', 6900, '/boutique/photos/NAR-ED-01.jpg', true, true, 13, 25, 0, 3),
  ('Box découverte du mois', 'nar-ed-02', 'Réf. NAR-ED-02', 'Une sélection de produits bien-être renouvelée chaque mois.', 'editions', 3900, '/boutique/photos/NAR-ED-02.jpg', false, true, 14, 25, 0, 3),
  ('Carte cadeau Narcisse', 'nar-ed-03', 'Réf. NAR-ED-03', 'À offrir pour un soin, un atelier ou un produit. Montant au choix.', 'editions', 3000, '/boutique/photos/NAR-ED-03.jpg', false, true, 15, 25, 0, 3)
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
  stock_on_hand = excluded.stock_on_hand,
  stock_reserved = 0,
  stock_alert_threshold = excluded.stock_alert_threshold,
  updated_at = now();

-- Vérification rapide (dispo = stock_on_hand - stock_reserved)
-- select slug, published, price_cents, stock_on_hand, stock_reserved,
--        (stock_on_hand - stock_reserved) as dispo
-- from public.products
-- order by sort_order;