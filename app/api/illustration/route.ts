import { requireConfiguredValue } from '@/lib/service-config';

const POLLINATIONS_BASE_URL = 'https://gen.pollinations.ai';
const DEFAULT_IMAGE_MODEL = process.env.POLLINATIONS_IMAGE_MODEL ?? 'flux';

function getPollinationsApiKey() {
  return requireConfiguredValue('POLLINATIONS_API_KEY', process.env.POLLINATIONS_API_KEY);
}

function parseInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.round(parsed);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const prompt = url.searchParams.get('prompt')?.trim();

    if (!prompt) {
      return Response.json({ error: 'Missing prompt query parameter.' }, { status: 400 });
    }

    const model = (url.searchParams.get('model') ?? DEFAULT_IMAGE_MODEL).trim();
    const width = parseInteger(url.searchParams.get('width'), 768);
    const height = parseInteger(url.searchParams.get('height'), 1024);
    const seed = parseInteger(url.searchParams.get('seed'), 0);
    const safe = (url.searchParams.get('safe') ?? 'privacy,secrets').trim();

    const imageUrl = new URL(`${POLLINATIONS_BASE_URL}/image/${encodeURIComponent(prompt)}`);
    imageUrl.searchParams.set('model', model);
    imageUrl.searchParams.set('width', String(width));
    imageUrl.searchParams.set('height', String(height));
    imageUrl.searchParams.set('seed', String(seed));
    imageUrl.searchParams.set('safe', safe);

    const response = await fetch(imageUrl.toString(), {
      headers: {
        Authorization: `Bearer ${getPollinationsApiKey()}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();

      return Response.json(
        { error: `Pollinations image request failed: ${response.status} ${errorText}` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get('content-type') ?? 'image/jpeg';
    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected illustration generation error.',
      },
      { status: 500 },
    );
  }
}
