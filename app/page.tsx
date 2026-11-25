import Header from "@/components/sections/Header";
import Hero from "@/components/hero/Hero";
import Philosophy from "@/components/sections/Philosophy";
import Dimensions from "@/components/sections/Dimensions";
import Experience from "@/components/sections/Experience";
import Boutique from "@/components/sections/Boutique";
import Conversion from "@/components/sections/Conversion";
import Footer from "@/components/sections/Footer";
import JsonLd from "@/components/sections/JsonLd";
import Ready from "@/components/providers/Ready";
import { getFeaturedProducts } from "@/lib/boutique/queries";

export const revalidate = 60;

export default async function Home() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <Dimensions />
        <Experience />
        <Boutique featured={featured} />
        <Conversion />
      </main>
      <Footer />
      <JsonLd />
      <Ready />
    </>
  );
}
