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

const SignUpWidget = dynamic(
  () => import('@clerk/nextjs').then((module) => module.SignUp),
  {
    ssr: false,
    loading: () => <div className="min-h-[32rem] rounded-[1.5rem] bg-slate-100/80" />,
  },
);

export default function SignUpPage() {
  if (!isClerkConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <ClerkSetupNotice
          className="w-full"
          title="Account creation is disabled until Clerk is configured."
          description="MindBloom can only create accounts after you provide real Clerk API keys in .env.local and restart the server."
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-bloom backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex items-center justify-center bg-white/70 p-8 order-2 lg:order-1">
          <div className="w-full max-w-md">
            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">Join MindBloom</p>
              <h1 className="mt-2 text-3xl font-semibold text-bloom-ink">Create your account</h1>
              <p className="mt-3 text-sm text-slate-600">
                Already have an account?{' '}
                <Link href={clerkSignInUrl} className="font-semibold text-bloom-plum">
                  Sign in instead
                </Link>
                .
              </p>
            </div>
            <SignUpWidget
              path={clerkSignUpUrl}
              routing="path"
              signInUrl={clerkSignInUrl}
              forceRedirectUrl={clerkSignUpForceRedirectUrl}
              signInForceRedirectUrl={clerkSignInForceRedirectUrl}
            />
          </div>
        </section>

        <section className="order-1 bg-gradient-to-br from-bloom-gold via-[#ffc95f] to-bloom-coral p-10 text-bloom-ink lg:order-2">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-bloom-ink/70">A playful writing ritual</p>
          <h2 className="mt-6 text-4xl font-semibold leading-tight">Give every bedtime a brighter beginning.</h2>
          <p className="mt-5 max-w-md text-base leading-7 text-bloom-ink/80">
            MindBloom helps families turn characters, settings, and wonder-filled prompts into stories that feel calm, warm, and easy to revisit.
          </p>
          <div className="mt-10 rounded-[1.75rem] bg-white/45 p-5 text-sm leading-7 text-bloom-ink/75">
            Streaming generation keeps the magic visible while the story grows, and your saved library stays ready for the next cozy read-aloud.
          </div>
        </section>
      </div>
    </main>
  );
}
