import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard_admin/:path*", "/dashboard_employe/:path*", "/dashboard_lina/:path*", "/dashboard_travailleuse-2/:path*"],
};