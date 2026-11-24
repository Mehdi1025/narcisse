/** Données structurées (à compléter : adresse, téléphone, horaires). Rien n'est inventé. */
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: "Narcisse",
    description: "Lieu de soin global : santé mentale, santé physique et santé sociale.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://narcisse.example",
    slogan: "Bien plus qu'un reflet.",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
