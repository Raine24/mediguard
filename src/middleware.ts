import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const path = req.nextUrl.pathname;
    const role = req.nextauth.token?.role as string;
    
    if (path.startsWith("/admin") && path !== "/admin/login") {
      if (!["SUPER_ADMIN", "ADMIN", "SUPPORT_AGENT"].includes(role)) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/dashboard")) {
          return !!token;
        }
        // Let the middleware function handle the /admin logic and redirects
        return true; 
      },
    },
  }
);

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
