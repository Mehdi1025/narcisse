"use client";
import { Symbol } from "@/components/brand/Symbol";
import type { ViewId } from "./Shell";

const COPY: Partial<Record<ViewId, { title: string; text: string; lot: string }>> = {
  boutique: { title: "Boutique", text: "Catalogue, stocks, commandes en ligne et ventes au comptoir.", lot: "Module e-commerce — après validation de la solution de caisse." },
  events: { title: "Événements", text: "Ateliers, cercles de discussion, inscriptions et listes d'attente.", lot: "Module événements — pôle santé sociale." },
  finances: { title: "Finances", text: "Chiffre d'affaires par pôle, encaissements, exports comptables.", lot: "Dépend du choix du logiciel de caisse et de facturation." },
  settings: { title: "Paramètres", text: "Horaires du lieu, prestations, durées, tarifs, comptes et droits.", lot: "Arrive avec l'authentification des comptes." },
};

export default function Soon({ view }: { view: ViewId }) {
  const c = COPY[view];
  return (
    <div className="app-card relative grid min-h-[420px] place-items-center overflow-hidden p-10 text-center">
      <Symbol className="pointer-events-none absolute -bottom-24 -right-10 h-[420px] w-auto text-encre/[0.035]" />
      <div className="relative max-w-md">
        <p className="app-label">Prochain module</p>
        <h2 className="mt-3 font-serif text-[40px] leading-none">{c?.title}</h2>
        <p className="mt-4 text-[14.5px] text-encre/65">{c?.text}</p>
        <p className="mt-6 text-[12.5px] text-encre/45">{c?.lot}</p>
      </div>
    </div>
  );
}
