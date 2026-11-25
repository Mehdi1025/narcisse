"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/content/boutique";
import { useShopCatalog } from "./shopCatalog";

type Line = { ref: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  count: number;
  total: number;
  add: (ref: string, qty?: number) => void;
  setQty: (ref: string, qty: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  bump: number;
};
const CartCtx = createContext<Ctx | null>(null);
const KEY = "narcisse-panier";

export function CartProvider({ children }: { children: ReactNode }) {
  const products = useShopCatalog();
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(v)) setRaw(v.filter((l) => products.some((p) => p.ref === l.ref)));
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

  const add = useCallback((ref: string, qty = 1) => {
    setRaw((l) =>
      l.some((x) => x.ref === ref)
        ? l.map((x) => (x.ref === ref ? { ...x, qty: Math.min(9, x.qty + qty) } : x))
        : [...l, { ref, qty }],
    );
    setBump((b) => b + 1);
  }, []);

  const setQty = useCallback((ref: string, qty: number) => {
    setRaw((l) => (qty <= 0 ? l.filter((x) => x.ref !== ref) : l.map((x) => (x.ref === ref ? { ...x, qty: Math.min(9, qty) } : x))));
  }, []);

  const value = useMemo(() => {
    const lines = raw
      .map((l) => {
        const product = products.find((p) => p.ref === l.ref);
        return product ? { ...l, product } : null;
      })
      .filter((x): x is Line & { product: Product } => x != null);
    return {
      lines,
      count: lines.reduce((a, l) => a + l.qty, 0),
      total: lines.reduce((a, l) => a + l.qty * l.product.price, 0),
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