"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { type StoryGenerationParams } from '@/lib/types';

interface StreamingTextProps {
  request: StoryGenerationParams | null;
  stream?: ReadableStream<Uint8Array> | null;
  onComplete?: (text: string) => void;
  onError?: (message: string) => void;
}

export function StreamingText({ request, stream, onComplete, onError }: StreamingTextProps) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const requestKey = useMemo(() => (request ? JSON.stringify(request) : null), [request]);

  useEffect(() => {
    let cancelled = false;

    async function consume(readableStream: ReadableStream<Uint8Array>) {
      const reader = readableStream.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      try {
        setText('');
        setStatus('streaming');

        while (!cancelled) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          fullText += decoder.decode(value, { stream: true });
          setText(fullText);
        }

        fullText += decoder.decode();

        if (!cancelled) {
          setText(fullText);
          setStatus('done');
          onComplete?.(fullText);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          onError?.(error instanceof Error ? error.message : 'Unable to stream the story.');
        }
      } finally {
        reader.releaseLock();
      }
    }

    async function startStreaming() {
      if (stream) {
        await consume(stream);
        return;
      }

      if (!request) {
        setStatus('idle');
        setText('');
        return;
      }

      try {
        const response = await fetch('/api/generate-story', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? 'Story generation failed.');
        }

        if (!response.body) {
          throw new Error('No response stream was returned.');
        }

        await consume(response.body);
      } catch (error) {
        if (!cancelled) {
          setStatus('error');
          onError?.(error instanceof Error ? error.message : 'Story generation failed.');
        }
      }
    }

    void startStreaming();

    return () => {
      cancelled = true;
    };
  }, [onComplete, onError, request, requestKey, stream]);

  return (
    <Card className="h-full border-white/90 bg-white/90">
      <CardHeader>
        <CardTitle>Live story preview</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[420px]">
        {status === 'idle' ? (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-[1.75rem] border border-dashed border-bloom-plum/25 bg-bloom-cream/70 p-8 text-center text-slate-500">
            Your story will appear here as soon as you start generating.
          </div>
        ) : (
          <div className="rounded-[1.75rem] bg-slate-950 px-6 py-5 text-base leading-8 text-white shadow-soft">
            <div className="mb-4 flex items-center gap-3 text-sm text-white/70">
              {status === 'streaming' ? <LoadingSpinner className="text-white/80" label="Streaming" /> : null}
              {status === 'done' ? <span>Story complete</span> : null}
              {status === 'error' ? <span>Streaming paused</span> : null}
            </div>
            <div className="whitespace-pre-wrap font-medium">
              {text}
              {status === 'streaming' ? <span className="animate-blink text-bloom-gold">|</span> : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
