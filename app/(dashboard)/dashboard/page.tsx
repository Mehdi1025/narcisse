import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardApp from "@/components/app/DashboardApp";
import { createClient } from "@/lib/supabase/server";
import type { WorkerId } from "@/lib/app/types";

export const metadata: Metadata = { title: "Espace équipe" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: row } = await supabase.from("profiles").select("role, worker_id").eq("id", user.id).maybeSingle();
  if (!row || row.role === "admin") redirect(row?.role === "admin" ? "/admin" : "/login");
  if (row.role !== "employee" || !row.worker_id) redirect("/login");

  return <DashboardApp initialProfile={row.worker_id as WorkerId} />;
}