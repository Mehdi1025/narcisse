import type { Metadata } from "next";
import CheckoutForm from "@/components/boutique/CheckoutForm";

export const metadata: Metadata = {
  title: "Commander — Boutique Narcisse",
  robots: { index: false },
};

export default async function CommandePage({
  searchParams,
}: {
  searchParams: Promise<{ annule?: string }>;
}) {
  const sp = await searchParams;
  return <CheckoutForm cancelled={sp.annule === "1"} />;
}