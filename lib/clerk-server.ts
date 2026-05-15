import 'server-only';

import {
	clerkPublishableKey,
	clerkSetupMessage,
	clerkSignInForceRedirectUrl,
	clerkSignInUrl,
	clerkSignUpForceRedirectUrl,
	clerkSignUpUrl,
	hasClerkPublishableKey,
} from '@/lib/clerk-client';

const clerkSecretKey = process.env.CLERK_SECRET_KEY;

export const hasClerkSecretKey = Boolean(clerkSecretKey && !clerkSecretKey.includes('placeholder'));

export const isClerkConfigured = hasClerkPublishableKey && hasClerkSecretKey;

export {
	clerkPublishableKey,
	clerkSetupMessage,
	clerkSignInForceRedirectUrl,
	clerkSignInUrl,
	clerkSignUpForceRedirectUrl,
	clerkSignUpUrl,
};