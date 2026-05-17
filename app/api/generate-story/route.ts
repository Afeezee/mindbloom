import { z } from 'zod';
import { groqSetupMessage, isGroqConfigured } from '@/lib/service-config';
import { AgeGroup, BookSize, LearningFocus } from '@/lib/types';
import { generateBookDraft } from '@/lib/groq';

const characterSchema = z.object({
  name: z.string(),
  role: z.string(),
  appearance: z.string(),
});

const generateStorySchema = z.object({
  title: z.string().trim().min(2).max(120),
  storyIdea: z.string().trim().min(10).max(1000),
  pageCount: z.number().int().min(8).max(50),
  ageGroup: z.nativeEnum(AgeGroup),
  learningFocus: z.nativeEnum(LearningFocus),
  bookSize: z.nativeEnum(BookSize),
  characters: z.array(characterSchema).optional(),
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

    const draft = await generateBookDraft(parsedPayload.data, parsedPayload.data.characters ?? []);

    return Response.json({ draft }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unexpected story generation error.';
    
    // Log detailed error info for debugging
    if (error instanceof Error) {
      console.error('Story generation error:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
    }
    
    return Response.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
