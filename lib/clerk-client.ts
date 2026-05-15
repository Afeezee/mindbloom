export const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const clerkSignInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in';

export const clerkSignUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up';

export const clerkSignInForceRedirectUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL || '/dashboard';

export const clerkSignUpForceRedirectUrl =
  process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL || '/dashboard';

export const hasClerkPublishableKey = Boolean(
  clerkPublishableKey && !clerkPublishableKey.includes('placeholder'),
);

export const clerkSetupMessage =
  'Add real Clerk API keys to .env.local and restart the app to enable sign-in, protected routes, and story saving.';