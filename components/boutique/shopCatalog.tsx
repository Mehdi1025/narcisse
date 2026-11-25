"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/content/boutique";

const ShopCatalogCtx = createContext<Product[] | null>(null);

export function ShopCatalogProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  const value = useMemo(() => products, [products]);
  return <ShopCatalogCtx.Provider value={value}>{children}</ShopCatalogCtx.Provider>;
}

export function useShopCatalog(): Product[] {
  const v = useContext(ShopCatalogCtx);
  if (!v) throw new Error("useShopCatalog hors ShopCatalogProvider");
  return v;
}