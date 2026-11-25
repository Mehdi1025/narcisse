import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardApp from "@/components/app/DashboardApp";
import { loadProfileByUserId } from "@/lib/auth/loadProfile";
import { profileFromRow } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const row = await loadProfileByUserId(user.id);
  if (profileFromRow(row) !== "admin") redirect("/dashboard");

  return <DashboardApp initialProfile="admin" />;
}