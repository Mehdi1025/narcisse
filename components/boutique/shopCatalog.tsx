"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/content/boutique";

type Ctx = {
  products: Product[];
  refreshStock: () => Promise<void>;
};

const ShopCatalogCtx = createContext<Ctx | null>(null);

export function ShopCatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const [live, setLive] = useState(products);
  useEffect(() => {
    setLive(products);
  }, [products]);

  const refreshStock = useCallback(async () => {
    const ids = live.map((p) => p.id).filter((id): id is string => Boolean(id)).slice(0, 50);
    if (!ids.length) return;
    try {
      const res = await fetch(`/api/boutique/stock?ids=${encodeURIComponent(ids.join(","))}`);
      if (!res.ok) return;
      const data = (await res.json()) as Record<string, number>;
      setLive((prev) =>
        prev.map((p) => {
          if (!p.id || data[p.id] === undefined) return p;
          return { ...p, stockAvailable: data[p.id] };
        }),
      );
    } catch {
      /* ignore */
    }
  }, [live]);

  const value = useMemo(() => ({ products: live, refreshStock }), [live, refreshStock]);

  return <ShopCatalogCtx.Provider value={value}>{children}</ShopCatalogCtx.Provider>;
}

export function useShopCatalog(): Product[] {
  const v = useContext(ShopCatalogCtx);
  if (!v) throw new Error("useShopCatalog hors ShopCatalogProvider");
  return v.products;
}

export function useShopStockRefresh(): () => Promise<void> {
  const v = useContext(ShopCatalogCtx);
  if (!v) throw new Error("useShopStockRefresh hors ShopCatalogProvider");
  return v.refreshStock;
}