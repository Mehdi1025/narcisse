import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/dashboard_admin",
    "/dashboard_employe",
    "/dashboard_lina/:path*",
    "/dashboard_travailleuse-2/:path*",
  ],
};