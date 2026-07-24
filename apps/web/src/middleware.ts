import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/client",
  "/employee",
  "/crm",
  "/pm",
  "/hr",
  "/finance",
  "/cms",
  "/ai",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/client/:path*",
    "/employee/:path*",
    "/crm/:path*",
    "/pm/:path*",
    "/hr/:path*",
    "/finance/:path*",
    "/cms/:path*",
    "/ai/:path*",
  ],
};
