import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

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

const hasClerkKeys =
  !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !!process.env.CLERK_SECRET_KEY;

export default hasClerkKeys
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function () {
      return NextResponse.next();
    };

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
