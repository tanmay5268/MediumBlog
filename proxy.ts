// @ts-nocheck
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isOnAuth = req.nextUrl.pathname.startsWith("/api/auth");

  if (isOnAuth) {
    return;
  }

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn && req.nextUrl.pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/auth/:path*", "/"],
};