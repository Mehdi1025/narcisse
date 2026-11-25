import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { dashboardForRole, normalizeAppPath, type SessionRole } from "@/lib/auth/login";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

const LEGACY: Record<string, string> = {
  "/dashboard_admin": "/admin",
  "/dashboard_employe": "/dashboard",
  "/dashboard_lina": "/dashboard",
  "/dashboard_travailleuse-2": "/dashboard",
};

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  if (LEGACY[path]) {
    const url = request.nextUrl.clone();
    url.pathname = LEGACY[path];
    return NextResponse.redirect(url);
  }

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

  const isAdmin = path === "/admin" || path.startsWith("/admin/");
  const isEmploye = path === "/dashboard" || path.startsWith("/dashboard/");

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
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isEmploye && role !== "lina" && role !== "t2") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}