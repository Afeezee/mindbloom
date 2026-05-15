import { z } from 'zod';
import { groqSetupMessage, isGroqConfigured } from '@/lib/service-config';
import { AgeGroup, StoryTheme } from '@/lib/types';
import { generateStoryStream } from '@/lib/groq';

const generateStorySchema = z.object({
  theme: z.nativeEnum(StoryTheme),
  ageGroup: z.nativeEnum(AgeGroup),
  mainCharacter: z.string().trim().min(2).max(80),
  setting: z.string().trim().min(2).max(120),
  specialElement: z.string().trim().max(120).optional(),
});

export async function POST(request: Request) {
  if (!isGroqConfigured) {
    return Response.json({ error: groqSetupMessage }, { status: 503 });
  }

  try {
    const payload = await request.json();
    const parsedPayload = generateStorySchema.safeParse(payload);

    if (!parsedPayload.success) {
      return Response.json(
        {
          error: 'Invalid story generation request.',
          issues: parsedPayload.error.flatten(),
        },
        { status: 400 },
      );
    }

    const stream = await generateStoryStream(parsedPayload.data);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story generation error.',
      },
      { status: 500 },
    );
  }
}
