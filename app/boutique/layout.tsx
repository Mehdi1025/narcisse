import type { ReactNode } from "react";
import { CartProvider } from "@/components/boutique/cart";
import { ShopCatalogProvider } from "@/components/boutique/shopCatalog";
import { getShopProducts } from "@/lib/boutique/getShopProducts";

export default async function BoutiqueLayout({ children }: { children: ReactNode }) {
  const products = await getShopProducts();
  return (
    <ShopCatalogProvider products={products}>
      <CartProvider>{children}</CartProvider>
    </ShopCatalogProvider>
  );
}