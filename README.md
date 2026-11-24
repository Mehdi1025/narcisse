# Narcisse — landing page

Site éditorial de Narcisse (santé mentale, santé physique, santé sociale), en Next.js (App Router), TypeScript, Tailwind CSS, GSAP + ScrollTrigger + SplitText, Lenis et WebGL.

## Lancer le projet

Prérequis : **Node.js 20.9 ou plus récent**.

```bash
npm install
npm run dev        # http://localhost:3000
```

| Commande | Usage |
|---|---|
| `npm run dev` | Développement |
| `npm run build` puis `npm start` | Build de production et serveur |
| `npm run export` | Site 100 % statique dans `out/` (hébergement sans serveur) |
| `npm run typecheck` | Vérification TypeScript |

Variable d'environnement facultative : `NEXT_PUBLIC_SITE_URL=https://votre-domaine.fr` (URL canonique, sitemap, données structurées).

## Concept

- **Hero « L'Arche-miroir »** : une arche sculpturale ouverte sur une eau vivante en WebGL, avec une porte de lumière et son reflet (le mythe de Narcisse réinventé). Le titre la traverse en trois lignes, avec un mode de fusion « difference » : il s'inverse sur la lumière.
  - **Entrée (environ 2,4 s)** : le contour de l'arche se trace, la fenêtre s'ouvre par masque avec un zoom arrière, le titre apparaît mot par mot, puis les textes et le bouton magnétique.
  - **Au défilement** : les lignes s'écartent comme des portes, l'arche s'avance et la caméra plonge légèrement. Le hero ne mesure qu'un écran : aucune longue intro.
  - **Interaction** : la souris ou le doigt crée des ondes dans l'eau (simulation physique en WebGL2, ondes calculées en repli WebGL1).
- **Manifeste** : le titre s'éclaire mot à mot au défilement, les textes se révèlent ligne par ligne, puis les bandes verticales du reflet apparaissent.
- **Trois pôles** : des panneaux plein écran empilés. Chaque pôle glisse par-dessus le précédent, qui recule et s'estompe. L'arche s'ouvre par masque, avec une profondeur interne. Sur mobile, les panneaux suivent le flux normal.
- **Expérience** : une arcade de trois arches qui s'ouvrent puis glissent à des vitesses différentes.
- **Boutique** : des cartes en arche révélées par masque. Au survol, le contour se trace, l'image s'agrandit, l'objet se soulève et une barre se dessine. Elles sont suivies d'un bandeau défilant qui accélère et s'incline selon la vitesse de défilement. Sur mobile, les cartes forment un carrousel horizontal aimanté.
- **Conversion** : une grande arche se trace autour de l'invitation, avec des boutons magnétiques.
- **Footer** : une frise en méandre qui se dessine, puis le logotype géant qui émerge.
- **Transverse** :
  - défilement amorti (Lenis) synchronisé avec le ticker GSAP ;
  - curseur en mode « difference » avec libellés (« Effleurez », « Bientôt »…) ;
  - séparateurs qui se tracent ;
  - en-tête qui se masque en descendant et réapparaît en remontant ;
  - menu plein écran sur mobile.

## Structure

```
app/                      layout (polices, SEO), page, pages provisoires, sitemap, robots
components/hero/          Hero, fenêtre d'eau (WaterArch) et moteur WebGL (water.ts)
components/sections/      Header, Philosophy, Dimensions, Experience, Boutique, Conversion, Footer
components/illustrations/ Illustrations SVG des pôles et des futurs produits
components/ui/            Curseur, effet magnétique, séparateur
components/providers/     Défilement amorti (Lenis + GSAP)
components/brand/         Logo vectoriel (symbole et logotype)
content/landing.ts        TOUT le texte du site (modifier ici, jamais dans les composants)
lib/gsap.ts               Plugins GSAP, courbes et révélation par lignes
```

## Réglages utiles

- **Textes** : `content/landing.ts`.
- **Couleurs et polices** : bloc `@theme` de `app/globals.css` (palette « Nuit égéenne »).
- **Eau du hero** : `components/hero/water.ts`.
  - `cam` : cadrage (hauteur, inclinaison, champ) ;
  - `EL` : hauteur de la porte de lumière ;
  - `AI` / `AG` : intensité de la lumière et du halo ;
  - `dmp` : amortissement des ondes.
- **Chorégraphies** : dans chaque section, bloc `useGSAP` (durées, décalages, déclencheurs).

## Qualité

- **HTML complet généré statiquement**, lisible sans JavaScript. La classe `js-motion` masque les éléments à animer seulement si JS est actif, avec une sécurité au bout de 4 s.
- **`prefers-reduced-motion` respecté** : animations, défilement amorti et WebGL sont désactivés, et un reflet statique s'affiche à la place.
- **Performance** : le moteur WebGL est chargé à la demande, sa densité de pixels est plafonnée, et le rendu se met en pause hors écran et quand l'onglet est caché.
- **Polices auto-hébergées** dans `app/fonts` : aucun appel à Google côté visiteur. Cormorant Garamond et Jost sont sous licence SIL Open Font License.

## À fournir par Narcisse

- Logo vectoriel d'origine : celui de `public/brand/` a été vectorisé depuis le brand book.
- Photos, si l'on veut remplacer les illustrations des pôles et des produits.
- Coordonnées, réseaux sociaux, mentions légales, politique de confidentialité.
- Pages `/reserver`, `/mentions-legales` et `/confidentialite` : elles sont aujourd'hui provisoires.
