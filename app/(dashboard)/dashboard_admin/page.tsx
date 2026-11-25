import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardApp from "@/components/app/DashboardApp";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Administration" };

export default async function DashboardAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard_admin");

  const { data: row } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!row || row.role !== "admin") redirect("/dashboard_employe");

  return <DashboardApp initialProfile="admin" />;
}