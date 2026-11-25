import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { loadProfileFromSession } from "@/lib/auth/loadProfile";
import { dashboardForProfile } from "@/lib/auth/login";
import { profileFromRow } from "@/lib/auth/session";
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

  const row = await loadProfileFromSession(supabase);
  const appProfile = profileFromRow(row);
  if (!appProfile) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("error", "profil");
    return NextResponse.redirect(url);
  }

  if (isAdmin && appProfile !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = dashboardForProfile(appProfile);
    return NextResponse.redirect(url);
  }

  if (isEmploye && appProfile === "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (isEmploye && appProfile !== "lina" && appProfile !== "t2") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}