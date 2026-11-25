import { products as staticProducts } from "@/content/boutique";
import type { Product } from "@/content/boutique";
import { getPublishedProducts } from "@/lib/boutique/queries";
import { productRowToShop } from "@/lib/boutique/toShopProduct";

export async function getShopProducts(): Promise<Product[]> {
  const rows = await getPublishedProducts();
  if (rows.length > 0) return rows.map(productRowToShop);
  return staticProducts;
}