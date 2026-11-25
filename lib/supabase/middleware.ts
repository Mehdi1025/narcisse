import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { dashboardForRole, type SessionRole } from "@/lib/auth/login";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdmin = path.startsWith("/dashboard_admin");
  const isEmploye = path.startsWith("/dashboard_employe");
  const isLegacyWorker = path.startsWith("/dashboard_lina") || path.startsWith("/dashboard_travailleuse-2");

  if (isLegacyWorker) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard_employe";
    return NextResponse.redirect(url);
  }

  if (!isAdmin && !isEmploye) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  const role = profile?.role as SessionRole | undefined;
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "profil");
    return NextResponse.redirect(url);
  }

  if (isAdmin && role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = dashboardForRole(role);
    return NextResponse.redirect(url);
  }

  if (isEmploye && role === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard_admin";
    return NextResponse.redirect(url);
  }

  if (isEmploye && role !== "lina" && role !== "t2") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}