import "server-only";
import { revalidatePath } from "next/cache";

/** À appeler après toute modification visible publiquement (catalogue, stock, ateliers). */
export function revalidateShop() {
  revalidatePath("/");
  revalidatePath("/boutique", "layout");
}

export function revalidateWorkshops() {
  revalidatePath("/ateliers");
}