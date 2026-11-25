import type { Metadata } from "next";
import AteliersPublic from "@/components/ateliers/AteliersPublic";
import { getPublishedWorkshops } from "@/lib/workshops/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ateliers & événements — Narcisse",
  description: "Ateliers et rencontres du pôle santé sociale : inscriptions en ligne et liste d'attente.",
  alternates: { canonical: "/ateliers" },
};

export default async function Page() {
  const workshops = await getPublishedWorkshops();
  return <AteliersPublic workshops={workshops} />;
}