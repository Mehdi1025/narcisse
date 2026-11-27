"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Product } from "@/content/boutique";
import { useShopCatalog, useShopStockRefresh } from "./shopCatalog";

type Line = { ref: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  count: number;
  total: number;
  canCheckout: boolean;
  add: (ref: string, qty?: number) => boolean;
  setQty: (ref: string, qty: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  bump: number;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "narcisse-panier";

/** Produit ajoutable au panier (stock ou démo sans UUID). */
export function canAddProduct(p: Product): boolean {
  if (p.id && p.stockAvailable !== undefined && p.stockAvailable <= 0) return false;
  return true;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useShopCatalog();
  const refreshStock = useShopStockRefresh();
  const pathname = usePathname();
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (open) void refreshStock();
  }, [open, refreshStock]);

  useEffect(() => {
    if (pathname === "/boutique/commande") void refreshStock();
  }, [pathname, refreshStock]);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (!Array.isArray(v)) return;
      const merged = new Map<string, number>();
      for (const item of v) {
        if (!item || typeof item.ref !== "string") continue;
        if (!products.some((p) => p.ref === item.ref)) continue;
        const qty = Math.min(9, Math.max(1, Number(item.qty) || 1));
        merged.set(item.ref, Math.min(9, (merged.get(item.ref) ?? 0) + qty));
      }
      setRaw([...merged.entries()].map(([ref, qty]) => ({ ref, qty })));
    } catch {
      /* ignore */
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {
      /* ignore */
    }
  }, [raw]);

  const maxQty = useCallback(
    (product: Product) => {
      if (product.stockAvailable == null) return 9;
      return Math.min(9, Math.max(0, product.stockAvailable));
    },
    [],
  );

  const add = useCallback(
    (ref: string, qty = 1): boolean => {
      const product = products.find((p) => p.ref === ref);
      if (!product || !canAddProduct(product)) return false;
      let ok = false;
      setRaw((l) => {
        const cap = maxQty(product);
        if (cap <= 0) return l;
        ok = true;
        return l.some((x) => x.ref === ref)
          ? l.map((x) => (x.ref === ref ? { ...x, qty: Math.min(cap, x.qty + qty) } : x))
          : [...l, { ref, qty: Math.min(cap, qty) }];
      });
      if (ok) setBump((b) => b + 1);
      return ok;
    },
    [products, maxQty],
  );

  const setQty = useCallback(
    (ref: string, qty: number) => {
      const product = products.find((p) => p.ref === ref);
      const cap = product ? maxQty(product) : 9;
      setRaw((l) =>
        qty <= 0 ? l.filter((x) => x.ref !== ref) : l.map((x) => (x.ref === ref ? { ...x, qty: Math.min(cap, qty) } : x)),
      );
    },
    [products, maxQty],
  );

  const value = useMemo(() => {
    const lines = raw
      .map((l) => {
        const product = products.find((p) => p.ref === l.ref);
        return product ? { ...l, product } : null;
      })
      .filter((x): x is Line & { product: Product } => x != null);
    const canCheckout =
      lines.length > 0 &&
      lines.every((l) => Boolean(l.product.id)) &&
      lines.every((l) => l.product.stockAvailable === undefined || l.product.stockAvailable >= l.qty);

    return {
      lines,
      count: lines.reduce((a, l) => a + l.qty, 0),
      total: lines.reduce((a, l) => a + l.qty * l.product.price, 0),
      canCheckout,
      add,
      setQty,
      open,
      setOpen,
      bump,
    };
  }, [raw, add, setQty, open, bump, products]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart hors CartProvider");
  return c;
}