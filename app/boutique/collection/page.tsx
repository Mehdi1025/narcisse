import { redirect } from "next/navigation";

export default function LegacyCollectionPage() {
  redirect("/boutique#selection");
}