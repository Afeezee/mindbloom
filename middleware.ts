import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkConfigured } from '@/lib/clerk-server';

const isProtectedRoute = createRouteMatcher([
  '/',
  '/dashboard(.*)',
  '/stories(.*)',
  '/api/save-story(.*)',
  '/api/stories(.*)',
]);

export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : function middleware() {
      return NextResponse.next();
    };

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/(api|trpc)(.*)'],
};
