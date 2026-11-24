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

// Landing générée statiquement (SSG) : HTML complet et lisible sans JavaScript.
export const dynamic = "force-static";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Philosophy />
        <Dimensions />
        <Experience />
        <Boutique />
        <Conversion />
      </main>
      <Footer />
      <JsonLd />
      <Ready />
    </>
  );
}
