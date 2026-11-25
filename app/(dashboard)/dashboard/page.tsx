import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardApp from "@/components/app/DashboardApp";
import { loadProfileFromSession } from "@/lib/auth/loadProfile";
import { profileFromRow } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Espace équipe" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const row = await loadProfileFromSession(supabase);
  const appProfile = profileFromRow(row);
  if (!appProfile || appProfile === "admin") redirect(appProfile === "admin" ? "/admin" : "/login");

  return <DashboardApp initialProfile={appProfile} />;
}