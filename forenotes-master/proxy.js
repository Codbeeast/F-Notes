import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/leaderboard(.*)',
  '/tradeAssistant(.*)',
  '/strategy(.*)',
  '/tradeJournal(.*)',
  '/psychology(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/payment(.*)',
  '/profile(.*)', // Clerk UserProfile handles its own authentication
  '/api/subscription/webhook(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // For protected routes, first check authentication
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Note: Subscription checking is handled client-side and in API routes
    // to avoid database calls in middleware edge runtime
    // The client will redirect to /pricing if subscription is inactive
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}