"use client";

import { useEffect, useMemo, useState } from 'react';

interface IllustrationImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  retries?: number;
}

function withRetryToken(url: string, retry: number) {
  if (retry <= 0) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}retry=${retry}`;
}

export function IllustrationImage({
  src,
  alt,
  className,
  placeholderClassName,
  retries = 2,
}: IllustrationImageProps) {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  const resolvedSource = useMemo(() => withRetryToken(src, attempt), [src, attempt]);

  useEffect(() => {
    setAttempt(0);
    setStatus('loading');
  }, [src]);

  useEffect(() => {
    if (status !== 'error' || attempt >= retries) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAttempt((value) => value + 1);
      setStatus('loading');
    }, 700 * 2 ** attempt);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [attempt, retries, status]);

  return (
    <div className="relative">
      {status !== 'loaded' ? (
        <div
          className={
            placeholderClassName ??
            'mb-4 flex h-[280px] w-full items-center justify-center rounded-2xl border border-dashed border-bloom-plum/20 bg-bloom-cream/70 text-sm text-slate-500'
          }
        >
          {status === 'error' ? 'Illustration unavailable right now.' : 'Generating illustration...'}
        </div>
      ) : null}
      <img
        src={resolvedSource}
        alt={alt}
        className={`${className ?? 'w-full'} ${status === 'loaded' ? 'block' : 'hidden'}`}
        loading="lazy"
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
