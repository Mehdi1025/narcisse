import type { ProductKey } from "@/content/landing";

export type ProductUniverse = ProductKey;

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  universe: ProductUniverse;
  price_cents: number | null;
  image_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  stock_on_hand?: number;
  stock_reserved?: number;
  stock_alert_threshold?: number;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string;
  universe: ProductUniverse;
  price_cents?: number | null;
  image_url?: string | null;
  featured?: boolean;
  published?: boolean;
  sort_order?: number;
  stock_on_hand?: number;
  stock_alert_threshold?: number;
};