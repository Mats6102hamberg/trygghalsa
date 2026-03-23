import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/(dashboard)(.*)',
  '/api/events(.*)',
  '/api/ai(.*)',
  '/api/health(.*)',
  '/api/medications(.*)',
  '/api/appointments(.*)',
  '/api/questions(.*)',
  '/api/dashboard(.*)',
  '/api/journal(.*)',
  '/api/care(.*)',
  '/api/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
