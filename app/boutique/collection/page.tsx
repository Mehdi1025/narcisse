import type { Metadata } from "next";
import Header from "@/components/sections/Header";
import Footer from "@/components/sections/Footer";
import CollectionView from "@/components/boutique/CollectionView";
import Ready from "@/components/providers/Ready";
import { getPublishedProducts } from "@/lib/boutique/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Toute la collection — Narcisse",
  description:
    "Essentiels beauté, bien-être et développement personnel — la collection Narcisse, dans le prolongement de l'expérience au salon.",
};

export default async function CollectionPage() {
  const products = await getPublishedProducts();

  return (
    <>
      <Header />
      <main className="min-h-dvh bg-encre">
        <CollectionView products={products} />
      </main>
      <Footer />
      <Ready />
    </>
  );
}