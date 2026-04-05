import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Supabase sometimes redirects to Site URL root (?code=...) instead of /auth/callback.
  // Forward so exchangeCodeForSession runs in app/auth/callback/route.ts.
  const url = request.nextUrl.clone();
  if (url.searchParams.has("code") && !url.pathname.startsWith("/auth/callback")) {
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
