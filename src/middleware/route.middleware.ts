import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Route protection middleware for admin routes
export default withAuth(
  function middleware(req) {
    // Check if the request is for an admin route
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token;

      // If user is not authenticated or is not an admin, redirect to home
      if (!token || token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Configure which routes to protect
export const config = {
  matcher: ["/admin/:path*"],
};
