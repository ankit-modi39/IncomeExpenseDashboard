import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
    publicRoutes: ['/'],
    afterAuth(auth, req) {
        // Handle users who aren't authenticated
        if (!auth.userId && !auth.isPublicRoute) {
            return NextResponse.redirect(new URL('/sign-in', req.url));
        }

        // If the user is logged in and trying to access sign-in page,
        // redirect them to /dashboard
        if (auth.userId && req.nextUrl.pathname === '/sign-in') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }
});

export const config = {
    matcher: [
        "/((?!.+\\.[\\w]+$|_next).*)",
        "/",
        "/(api|trpc)(.*)"
    ],
};