import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardApp from "@/components/app/DashboardApp";
import { createClient } from "@/lib/supabase/server";
import type { WorkerId } from "@/lib/app/types";

export const metadata: Metadata = { title: "Espace équipe" };

export default async function DashboardEmployePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard_employe");

  const { data: row } = await supabase.from("profiles").select("role, worker_id").eq("id", user.id).maybeSingle();
  if (!row || row.role === "admin") redirect(row?.role === "admin" ? "/dashboard_admin" : "/login");
  if (row.role !== "lina" && row.role !== "t2") redirect("/login");

  return <DashboardApp initialProfile={row.role as WorkerId} />;
}