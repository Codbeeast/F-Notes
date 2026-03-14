import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Protect all routes under /dashboard by default.
// Admin routes /admin and /api/admin are NOT protected by Clerk 
// because they use a separate custom JWT authentication system.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)'
]);

// Explicitly allow server-to-server API endpoints that forenotes-master calls without browser auth.
// DO NOT add user-facing routes like /api/referral/request-access here!
const isPublicRoute = createRouteMatcher([
  '/api/referral/validate(.*)',
  '/api/referral/record-signup(.*)',
  '/api/referral/track-plan(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
      return;
  }

  if (isProtectedRoute(req)) {
      await auth.protect();
  }
}, {
  signInUrl: '/',
  signUpUrl: '/auth/sign-up',
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
