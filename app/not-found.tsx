import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-xl p-10 text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-bloom-teal">MindBloom</p>
        <h1 className="mt-4 text-4xl font-semibold text-bloom-ink">That page wandered off.</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          We couldn&apos;t find what you were looking for. Let&apos;s take you back to where the stories are.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard">
            <Button>Go to Story Home</Button>
          </Link>
          <Link href="/stories/new">
            <Button variant="secondary">Create New Story</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
