import { Symbol } from "@/components/brand/Symbol";

/** Page provisoire (réservation, pages légales) en attendant leur contenu. */
export default function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-encre px-6 text-center text-ivoire">
      <div>
        <Symbol className="mx-auto h-24 w-auto" />
        <h1 className="display mt-10 text-[clamp(40px,6vw,80px)]">{title}</h1>
        <p className="mx-auto mt-6 max-w-[30em] text-ivoire/70">{text}</p>
        <a href="/" className="btn btn-line on-dark mt-10">
          <span className="btn-label">Retour à l&apos;accueil</span>
        </a>
      </div>
    </main>
  );
}
