import { boutique, type ProductKey } from "@/content/landing";

export const UNIVERSE_LABEL: Record<ProductKey, string> = Object.fromEntries(
  boutique.universes.map((u) => [u.key, u.name]),
) as Record<ProductKey, string>;

export const COLLECTION_PATH = "/boutique/collection";