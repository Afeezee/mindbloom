import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkConfigured } from '@/lib/clerk-server';

const isAppRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/stories(.*)',
]);

const isProtectedRoute = createRouteMatcher([
  '/api/save-story(.*)',
  '/api/stories(.*)',
  '/api/generate-outline(.*)',
]);

export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      const { userId } = await auth();

      if (isAppRoute(req) && !userId) {
        return NextResponse.redirect(new URL('/', req.url));
      }

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
