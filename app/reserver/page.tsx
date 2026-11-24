import type { Metadata } from "next";
import Placeholder from "@/components/sections/Placeholder";

export const metadata: Metadata = { title: "Prendre rendez-vous — Narcisse", robots: { index: false } };

export default function Page() {
  return <Placeholder title="Prendre rendez-vous" text="La réservation en ligne arrive bientôt." />;
}
