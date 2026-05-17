import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ClerkSetupNotice } from '@/components/auth/ClerkSetupNotice';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { isClerkConfigured } from '@/lib/clerk-server';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let showSetupNotice = false;

  if (isClerkConfigured) {
    const { userId } = await auth();

    if (!userId) {
      redirect('/');
    }
  } else {
    showSetupNotice = true;
  }

  return (
    <div className="min-h-screen text-bloom-ink">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Navbar isClerkConfigured={isClerkConfigured} />
          <main className="flex-1">
            {showSetupNotice ? (
              <div className="section-shell pb-0 pt-8">
                <ClerkSetupNotice title="Dashboard access is waiting on Clerk setup." />
              </div>
            ) : null}
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
