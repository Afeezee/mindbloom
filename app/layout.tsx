import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Fredoka, Nunito } from 'next/font/google';
import {
  clerkPublishableKey,
  clerkSignInForceRedirectUrl,
  clerkSignInUrl,
  clerkSignUpForceRedirectUrl,
  clerkSignUpUrl,
  isClerkConfigured,
} from '@/lib/clerk-server';
import './globals.css';

const headingFont = Fredoka({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'MindBloom',
  description: "MindBloom is an AI-powered children's story writing app built with Next.js, Clerk, Supabase, and Groq.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = isClerkConfigured ? (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      signInForceRedirectUrl={clerkSignInForceRedirectUrl}
      signUpForceRedirectUrl={clerkSignUpForceRedirectUrl}
    >
      {children}
    </ClerkProvider>
  ) : (
    children
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${headingFont.variable} ${bodyFont.variable} min-h-screen text-bloom-ink antialiased`}>
        {content}
      </body>
    </html>
  );
}
