import 'server-only';

import Groq from 'groq-sdk';
import { requireConfiguredValue } from '@/lib/service-config';
import { AgeGroup, type StoryGenerationParams } from '@/lib/types';

const MODEL_NAME = 'meta-llama/llama-3.3-70b-versatile';

function getGroqClient() {
  const apiKey = requireConfiguredValue('GROQ_API_KEY', process.env.GROQ_API_KEY);

  return new Groq({ apiKey });
}

function getAgeWordGuidance(ageGroup: AgeGroup) {
  switch (ageGroup) {
    case AgeGroup.EARLY:
      return 'Write 300-600 words total using very simple, reassuring vocabulary and rhythmic repetition.';
    case AgeGroup.MIDDLE:
      return 'Write 500-900 words total using playful but accessible vocabulary and a clear beginning, middle, and end.';
    case AgeGroup.OLDER:
      return 'Write 800-1400 words total using richer vocabulary, stronger scene detail, and gentle emotional depth.';
    default:
      return 'Write an age-appropriate story for children.';
  }
}

function buildSystemPrompt(ageGroup: AgeGroup): string {
  return [
    'You are MindBloom, a careful storyteller for children.',
    'Always produce child-safe, emotionally supportive, age-appropriate stories.',
    'Never include violence, scary scenes, horror, cruelty, bullying, unsafe behavior, romance, or mature themes.',
    'Use positive themes such as curiosity, courage, kindness, empathy, wonder, teamwork, and imagination.',
    'Use age-appropriate vocabulary and sentence length for the requested age band.',
    getAgeWordGuidance(ageGroup),
    'Write in plain text only.',
    'Do not include markdown, headings, bullet points, or commentary outside the story.',
    'Make the story feel complete, vivid, and warm from the first sentence to the last.',
  ].join(' ');
}

function buildUserPrompt(params: StoryGenerationParams): string {
  const optionalElement = params.specialElement?.trim()
    ? `Include this special element: ${params.specialElement.trim()}.`
    : 'You may introduce one whimsical surprise that fits the setting.';

  return [
    `Theme: ${params.theme}.`,
    `Age group: ${params.ageGroup}.`,
    `Main character: ${params.mainCharacter.trim()}.`,
    `Setting: ${params.setting.trim()}.`,
    optionalElement,
    'Write a complete children\'s story with a strong opening, a gentle challenge, and a joyful, reassuring ending.',
    'Keep the language imaginative, sensory, and easy to read aloud.',
  ].join(' ');
}

export function buildPromptUsed(params: StoryGenerationParams): string {
  return buildUserPrompt(params);
}

export async function generateStoryStream(
  params: StoryGenerationParams,
): Promise<ReadableStream<Uint8Array>> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: MODEL_NAME,
    stream: true,
    temperature: 0.85,
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(params.ageGroup),
      },
      {
        role: 'user',
        content: buildUserPrompt(params),
      },
    ],
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;

          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function generateStoryTitle(content: string): Promise<string> {
  const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: MODEL_NAME,
    temperature: 0.7,
    max_tokens: 32,
    messages: [
      {
        role: 'system',
        content:
          'Create a single creative title for a children\'s story. Return only the title with no quotation marks or extra commentary.',
      },
      {
        role: 'user',
        content: content,
      },
    ],
  });

  const rawTitle = completion.choices[0]?.message?.content?.trim();
  const cleanedTitle = rawTitle?.replace(/^['\"]+|['\"]+$/g, '') ?? '';

  return cleanedTitle || 'A MindBloom Story';
}
