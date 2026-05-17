import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ClerkSetupNotice } from '@/components/auth/ClerkSetupNotice';
import {
  clerkSignInForceRedirectUrl,
  clerkSignInUrl,
  clerkSignUpForceRedirectUrl,
  clerkSignUpUrl,
  isClerkConfigured,
} from '@/lib/clerk-server';

const SignInWidget = dynamic(
  () => import('@clerk/nextjs').then((module) => module.SignIn),
  {
    ssr: false,
    loading: () => <div className="min-h-[28rem] rounded-[1.5rem] bg-slate-100/80" />,
  },
);

export default function SignInPage() {
  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <ClerkSetupNotice
          className="w-full"
          title="Sign in is temporarily unavailable."
          description="We&apos;re still finishing setup. Please check back in a moment."
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-bloom backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bg-gradient-to-br from-bloom-plum via-[#7767dc] to-bloom-teal p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/75">MindBloom</p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Welcome back to story time.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/80">
            Pick up where you left off, revisit favorites, and create a brand-new adventure in just a few taps.
          </p>
          <div className="mt-10 rounded-[1.75rem] bg-white/10 p-5 text-sm leading-7 text-white/80">
            Tonight&apos;s story can be silly, cozy, brave, or dreamy. You choose the vibe, we help you bring it to life.
          </div>
        </section>

        <section className="flex items-center justify-center bg-white/70 p-8">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Welcome back</p>
              <h2 className="mt-2 text-3xl font-semibold text-bloom-ink">Sign in</h2>
              <p className="mt-3 text-sm text-slate-600">
                Need an account?{' '}
                <Link href={clerkSignUpUrl} className="font-semibold text-bloom-plum">
                  Create one here
                </Link>
                .
              </p>
            </div>
            <SignInWidget
              path={clerkSignInUrl}
              routing="path"
              signUpUrl={clerkSignUpUrl}
              forceRedirectUrl={clerkSignInForceRedirectUrl}
              signUpForceRedirectUrl={clerkSignUpForceRedirectUrl}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
