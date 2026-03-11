import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(['/(.*)']);

const proxy = clerkMiddleware(async (auth, request) => {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes EXCEPT the auth routes
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/auth')) {
        const adminToken = request.cookies.get('adminToken')?.value;

        // If no token exists, redirect to custom admin sign-in
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/auth/sign-in', request.url));
        }
    }

    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export default proxy;

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
