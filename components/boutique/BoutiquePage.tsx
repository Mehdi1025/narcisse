"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { euro, shop, universes, type Product, type UniverseKey } from "@/content/boutique";
import { bookingHref } from "@/content/landing";
import { Logotype, Symbol } from "@/components/brand/Symbol";
import { useSmoothScroll } from "@/components/providers/SmoothScroll";
import Magnetic from "@/components/ui/Magnetic";
import Footer from "@/components/sections/Footer";
import Ready from "@/components/providers/Ready";
import { canAddProduct, useCart } from "./cart";
import ShopHero from "./ShopHero";
import ShopGrid from "./ShopGrid";
import { GiftSpotlight, UniverseIndex } from "./ShopIndex";

/** Catalogue + panier : fournis par `app/boutique/layout.tsx` (un seul provider). */
export default function BoutiquePage() {
  return <Shop />;
}

function Shop() {
  const [filter, setFilter] = useState<"tout" | UniverseKey>("tout");
  const [product, setProduct] = useState<Product | null>(null);
  const { scrollTo } = useSmoothScroll();
  const pick = (k: UniverseKey) => {
    scrollTo("#selection");
    setTimeout(() => setFilter(k), 700);
  };
  return (
    <div className="shop">
      <ShopHeader />
      <main id="contenu">
        <ShopHero />
        <ShopGrid filter={filter} setFilter={setFilter} open={setProduct} />
        <UniverseIndex pick={pick} />
        <GiftSpotlight open={setProduct} />
      </main>
      <Footer base="/" />
      <ProductPanel product={product} close={() => setProduct(null)} />
      <CartPanel />
      <Ready />
    </div>
  );
}

function ShopHeader() {
  const ref = useRef<HTMLElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const [light, setLight] = useState(false);
  const { count, setOpen, bump } = useCart();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ref.current, { yPercent: -100, autoAlpha: 0, duration: 1.4, delay: 0.6, ease: "expo.out" });
        ScrollTrigger.create({
          start: "top top",
          end: "max",
          onUpdate: (s) =>
            gsap.to(ref.current, { yPercent: s.direction === 1 && s.scroll() > innerHeight * 0.6 ? -100 : 0, duration: 0.7, ease: "expo.out", overwrite: "auto" }),
        });
      });
      const hero = document.getElementById("top");
      if (hero) ScrollTrigger.create({ trigger: hero, start: "bottom 200px", onEnter: () => setLight(true), onLeaveBack: () => setLight(false) });
    },
    { scope: ref },
  );
  useEffect(() => {
    if (bump && badge.current) gsap.fromTo(badge.current, { scale: 1.8 }, { scale: 1, duration: 0.8, ease: "elastic.out(1, 0.4)" });
  }, [bump]);

  return (
    <header ref={ref} className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${light ? "bg-papier/90 text-encre backdrop-blur-md" : "text-ivoire"}`}>
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-6 px-6 md:px-12">
        <a href="/" className="flex items-center gap-3" aria-label="Narcisse — accueil">
          <Symbol className="h-9 w-auto" />
          <Logotype className="hidden h-[15px] w-auto sm:block" />
        </a>
        <nav className="hidden items-center gap-9 text-[13px] tracking-[0.12em] uppercase md:flex" aria-label="Navigation">
          <a href="/" className="link-line">Accueil</a>
          <a href="#selection" className="link-line" aria-current="page">Boutique</a>
          <a href={bookingHref} className="link-line">Rendez-vous</a>
        </nav>
        <Magnetic>
          <button
            type="button"
            onClick={() => setOpen(true)}
            data-cursor="Panier"
            className={`flex h-11 items-center gap-3 rounded-full border px-5 text-[12.5px] tracking-[0.16em] uppercase transition-colors ${light ? "border-encre/20 hover:bg-encre hover:text-ivoire" : "border-ivoire/30 hover:bg-ivoire hover:text-encre"}`}
          >
            Panier
            <span ref={badge} className="grid h-6 min-w-6 place-items-center rounded-full bg-bordeaux px-1.5 text-[11px] tracking-normal text-papier">{count}</span>
          </button>
        </Magnetic>
      </div>
    </header>
  );
}

function Panel({ open, close, label, children, wide }: { open: boolean; close: () => void; label: string; children: ReactNode; wide?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useGSAP(
    () => {
      if (!mounted || !root.current) return;
      const q = gsap.utils.selector(root);
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (open) {
        lenis?.stop();
        gsap.fromTo(q("[data-veil]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: reduce ? 0 : 0.6 });
        gsap.fromTo(q("[data-sheet]"), { xPercent: 100 }, { xPercent: 0, duration: reduce ? 0 : 1, ease: "expo.out" });
        gsap.from(q("[data-in]"), { y: 30, autoAlpha: 0, duration: reduce ? 0 : 1, stagger: 0.06, delay: 0.2, ease: "expo.out" });
      } else {
        lenis?.start();
        gsap.to(q("[data-veil]"), { autoAlpha: 0, duration: reduce ? 0 : 0.5 });
        gsap.to(q("[data-sheet]"), { xPercent: 100, duration: reduce ? 0 : 0.7, ease: "expo.inOut", onComplete: () => setMounted(false) });
      }
    },
    { dependencies: [open, mounted], scope: root },
  );

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [open, close]);

  if (!mounted) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={label}>
      <button type="button" data-veil className="absolute inset-0 bg-encre/50 backdrop-blur-[3px]" onClick={close} aria-label="Fermer" data-cursor="Fermer" />
      <aside data-sheet data-lenis-prevent className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-y-auto bg-papier text-encre ${wide ? "max-w-[980px]" : "max-w-[480px]"}`}>
        <button type="button" onClick={close} className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-papier/80 text-encre backdrop-blur hover:bg-encre hover:text-papier" aria-label="Fermer">
          <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        {children}
      </aside>
    </div>
  );
}

function ProductPanel({ product, close }: { product: Product | null; close: () => void }) {
  const { add, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [addError, setAddError] = useState<string | null>(null);
  const [last, setLast] = useState<Product | null>(product);
  useEffect(() => {
    if (product) {
      setLast(product);
      setQty(1);
    }
  }, [product]);
  const p = product ?? last;
  const u = universes.find((x) => x.key === p?.universe);
  return (
    <Panel open={!!product} close={close} label={p?.name ?? "Produit"} wide>
      {p && (
        <div className="grid min-h-full md:grid-cols-[1.05fr_1fr]">
          <div className="relative bg-ivoire md:min-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt={p.name} className="h-[58vh] w-full object-cover md:absolute md:inset-0 md:h-full" />
          </div>
          <div className="flex flex-col p-8 md:p-12">
            <p data-in className="eyebrow text-bordeaux">{u?.name}</p>
            <h2 data-in className="display mt-5 text-[clamp(38px,4vw,58px)] text-encre">{p.name}</h2>
            <p data-in className="mt-6 font-serif text-[30px]">
              {p.priceFrom && <span className="mr-2 text-[16px] text-gris/60">dès</span>}
              {euro(p.price)}
            </p>
            <p data-in className="mt-8 text-[16px] leading-relaxed text-gris">{p.description}</p>
            <div data-in className="mt-10 flex items-center gap-4">
              <div className="flex h-14 items-center rounded-full border border-encre/15">
                <button type="button" className="h-full px-5 text-[18px]" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Moins">−</button>
                <span className="w-6 text-center tabular-nums" aria-live="polite">{qty}</span>
                <button type="button" className="h-full px-5 text-[18px]" onClick={() => setQty((q) => Math.min(9, q + 1))} aria-label="Plus">+</button>
              </div>
              <button
                type="button"
                className="btn btn-fill flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canAddProduct(p)}
                onClick={() => {
                  setAddError(null);
                  if (!add(p.ref, qty)) {
                    setAddError(
                      p.id
                        ? "Produit épuisé — augmentez le stock dans l’admin boutique."
                        : "Produit indisponible à l’achat en ligne.",
                    );
                    return;
                  }
                  close();
                  setTimeout(() => setOpen(true), 450);
                }}
              >
                <span className="btn-label">{canAddProduct(p) ? "Ajouter au panier" : "Épuisé"}</span>
              </button>
            </div>
            {addError && <p className="mt-3 text-[13px] text-bordeaux">{addError}</p>}
            <dl data-in className="mt-auto grid gap-3 border-t border-encre/10 pt-8 text-[13px] text-gris/75">
              <div className="flex justify-between gap-4"><dt>Référence</dt><dd>{p.ref}</dd></div>
              <div className="flex justify-between gap-4"><dt>Paiement</dt><dd>{shop.checkoutNote}</dd></div>
              <p className="text-[12px] text-gris/55">{shop.imageNote}</p>
            </dl>
          </div>
        </div>
      )}
    </Panel>
  );
}

function CartPanel() {
  const { lines, total, open, setOpen, setQty, canCheckout } = useCart();
  return (
    <Panel open={open} close={() => setOpen(false)} label="Panier">
      <div className="flex min-h-full flex-col p-8">
        <p data-in className="eyebrow text-bordeaux">Votre sélection</p>
        <h2 data-in className="display mt-4 text-[48px]">Panier</h2>
        {lines.length === 0 ? (
          <div data-in className="my-auto py-16 text-center">
            <svg viewBox="0 0 60 80" className="mx-auto h-20 w-auto text-encre/20"><path d="M4 78V30a26 26 0 0 1 52 0v48" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            <p className="mt-6 text-gris/70">Votre panier est vide.</p>
            <button type="button" className="link-line mt-4 text-[14px]" onClick={() => setOpen(false)}>Continuer la visite</button>
          </div>
        ) : (
          <>
            <ul className="mt-8 divide-y divide-encre/10">
              {lines.map((l) => (
                <li key={l.ref} data-in className="flex gap-4 py-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.product.image} alt="" className="h-28 w-[88px] shrink-0 rounded-t-full object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="font-serif text-[21px] leading-tight">{l.product.name}</p>
                    <p className="mt-1 text-[13px] text-gris/60">{euro(l.product.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex h-9 items-center rounded-full border border-encre/15 text-[14px]">
                        <button type="button" className="h-full px-3" onClick={() => setQty(l.ref, l.qty - 1)} aria-label="Moins">−</button>
                        <span className="w-5 text-center tabular-nums">{l.qty}</span>
                        <button type="button" className="h-full px-3" onClick={() => setQty(l.ref, l.qty + 1)} aria-label="Plus">+</button>
                      </div>
                      <p className="font-serif text-[19px]">{euro(l.qty * l.product.price)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div data-in className="mt-auto border-t border-encre/15 pt-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow text-gris/60">Total</span>
                <span className="display text-[40px]">{euro(total)}</span>
              </div>
              {canCheckout ? (
                <Link href="/boutique/commande" className="btn btn-fill mt-6 block w-full text-center" onClick={() => setOpen(false)}>
                  <span className="btn-label">Commander</span>
                </Link>
              ) : (
                <button type="button" className="btn btn-fill mt-6 w-full cursor-not-allowed opacity-60" disabled>
                  <span className="btn-label">Commander</span>
                </button>
              )}
              <p className="mt-3 text-center text-[13px] text-gris/60">
                {canCheckout ? shop.checkoutNote : "Catalogue Supabase requis (produits publiés avec stock)."}
              </p>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}