import 'server-only';

import Groq from 'groq-sdk';
import { requireConfiguredValue } from '@/lib/service-config';
import {
  AgeGroup,
  StoryTheme,
  type BookDraft,
  type CharacterDescription,
  type StoryGenerationParams,
  type StoryOutline,
  type StoryBuilderInput,
} from '@/lib/types';

const DEFAULT_MODEL_CANDIDATES = [
  'meta-llama/llama-3.3-70b-versatile',
  'llama-3.3-70b-versatile',
  'llama-3.3-8b-instant',
  'meta-llama/llama-3.3-8b-instant',
  'llama-3.1-8b-instant',
];

function getGroqClient() {
  const apiKey = requireConfiguredValue('GROQ_API_KEY', process.env.GROQ_API_KEY);

  return new Groq({ apiKey });
}

function getModelCandidates() {
  const configuredModel = process.env.GROQ_MODEL?.trim();
  const configuredCandidates = process.env.GROQ_MODEL_CANDIDATES?.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([configuredModel, ...(configuredCandidates ?? []), ...DEFAULT_MODEL_CANDIDATES].filter(Boolean)));
}

function isModelNotFoundError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes('model_not_found') || message.includes('does not exist') || message.includes('do not have access');
}

function isFallbackEligibleError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    isModelNotFoundError(error) ||
    message.includes('rate limit') ||
    message.includes('rate_limit_exceeded') ||
    message.includes('tokens per day') ||
    message.includes('token limit') ||
    message.includes('tokens per minute') ||
    message.includes('request too large') ||
    message.includes('413') ||
    message.includes('429')
  );
}

function getBestErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown Groq API error.';
}

function compactText(value: string, maxLength: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildCompactCharacterSheet(characterDescriptions: CharacterDescription[]): string {
  if (characterDescriptions.length === 0) {
    return '';
  }

  return characterDescriptions
    .slice(0, 4)
    .map((c) => `${compactText(c.name, 24)}: ${compactText(c.appearance, 90)}`)
    .join('; ');
}

function getAgeWordGuidance(ageGroup: AgeGroup) {
  switch (ageGroup) {
    case AgeGroup.EARLY:
      return 'Keep each page very short, warm, and easy to read aloud.';
    case AgeGroup.MIDDLE:
      return 'Keep each page concise, playful, and easy to follow with a clear narrative arc.';
    case AgeGroup.OLDER:
      return 'Keep each page vivid, a little longer, and rich with meaningful detail.';
    default:
      return 'Write an age-appropriate story for children.';
  }
}

function buildSystemPrompt(ageGroup: AgeGroup): string {
  return [
    'You are MindBloom, an expert children\'s book author and page-by-page story planner.',
    'Always produce child-safe, emotionally supportive, age-appropriate books.',
    'Never include violence, scary scenes, horror, cruelty, bullying, unsafe behavior, romance, or mature themes.',
    'Use positive themes such as curiosity, courage, kindness, empathy, wonder, teamwork, and imagination.',
    'Write for picture-book and early-reader production, with consistent characters, page-aware pacing, and illustration-friendly scenes.',
    getAgeWordGuidance(ageGroup),
    'Return valid JSON only. Do not include markdown, code fences, headings, commentary, or extra text.',
  ].join(' ');
}

function buildOutlinePrompt(params: StoryBuilderInput): string {
  return [
    `Title: ${params.title.trim()}.`,
    `Story idea: ${params.storyIdea.trim()}.`,
    `Page count: ${params.pageCount} pages.`,
    `Age group: ${params.ageGroup}.`,
    `Learning focus: ${params.learningFocus}.`,
    `Book size: ${params.bookSize}.`,
    'Generate a story outline only — no full page text. Provide the overall summary, a list of main characters with their role and detailed physical appearance description, and a brief title and 1-2 sentence summary for each page.',
    'Keep the outline concise and child-safe.',
    'Output JSON only with this exact shape: {"title":"","subtitle":"","summary":"","theme":"Adventure|Fantasy|Animals|Science|Friendship|Mystery","characters":[{"name":"","role":"","appearance":""}],"pageOutlines":[{"pageNumber":1,"title":"","summary":""}]}',
  ].join(' ');
}

function buildBookPrompt(params: StoryGenerationParams, characterDescriptions: CharacterDescription[]): string {
  const pageStyleGuidance =
    params.ageGroup === AgeGroup.EARLY
      ? 'Each page should be 2-3 short warm sentences with simple words, rhythmic phrasing, and comforting repetition.'
      : params.ageGroup === AgeGroup.MIDDLE
        ? 'Each page should be 3-5 engaging sentences with playful dialogue and clear forward momentum.'
        : 'Each page should be 5-8 vivid sentences with richer detail, stronger stakes, and meaningful character growth.';

  const compactCharacterSheet = buildCompactCharacterSheet(characterDescriptions);

  const characterSheet = characterDescriptions.length > 0
    ? characterDescriptions
      .slice(0, 4)
      .map((c) => `${compactText(c.name, 24)} (${compactText(c.role, 20)}): ${compactText(c.appearance, 110)}`)
      .join('; ')
    : 'Characters will be defined by the story idea.';

  const illustrationRule = characterDescriptions.length > 0
    ? `CRITICAL ILLUSTRATION RULE: Keep each illustrationPrompt short. Start with "[CHARACTER KEY: ${compactCharacterSheet}]" and then describe only the scene for that page.`
    : 'Keep character appearance visually consistent across all page illustration prompts.';

  return [
    `Title: ${params.title.trim()}.`,
    `Story idea: ${compactText(params.storyIdea, 480)}.`,
    `Page count: ${params.pageCount} pages.`,
    `Age group: ${params.ageGroup}.`,
    `Learning focus: ${params.learningFocus}.`,
    `Book size: ${params.bookSize}.`,
    `Established character sheet: ${characterSheet}.`,
    'Create the complete illustrated children\'s book with full page text.',
    'The story must open with a strong hook, develop the learning focus naturally through the characters, and end with a warm memorable resolution.',
    'Choose theme: Adventure, Fantasy, Animals, Science, Friendship, or Mystery.',
    pageStyleGuidance,
    illustrationRule,
    'For coverImagePrompt, describe a vibrant cover illustration using the same character appearances from the character sheet.',
    'Respect the exact page count.',
    'Output JSON only with this shape: {"title":"","subtitle":"","theme":"Adventure|Fantasy|Animals|Science|Friendship|Mystery","ageGroup":"3-5|6-8|9-12","learningFocus":"...","bookSize":"...","pageCount":0,"summary":"","readingLevel":"","artDirection":"","coverImagePrompt":"","characters":[""],"pages":[{"pageNumber":1,"text":"","illustrationPrompt":""}]}',
  ].join(' ');
}

function getBookMaxTokens(pageCount: number): number {
  const estimated = 700 + pageCount * 90;
  return Math.min(2200, Math.max(900, estimated));
}

function normalizeTheme(theme: unknown): StoryTheme {
  const normalized = typeof theme === 'string' ? theme.trim().toLowerCase() : '';

  if (normalized === 'fantasy') return StoryTheme.FANTASY;
  if (normalized === 'animals') return StoryTheme.ANIMALS;
  if (normalized === 'science') return StoryTheme.SCIENCE;
  if (normalized === 'friendship') return StoryTheme.FRIENDSHIP;
  if (normalized === 'mystery') return StoryTheme.MYSTERY;
  return StoryTheme.ADVENTURE;
}

function ensureReadablePageText(text: string, ageGroup: AgeGroup): string {
  const trimmed = text.trim();

  if (trimmed.length >= 90) {
    return trimmed;
  }

  if (ageGroup === AgeGroup.EARLY) {
    return `${trimmed} The friends smiled, took a brave little step, and discovered that kindness made the whole day glow.`;
  }

  if (ageGroup === AgeGroup.MIDDLE) {
    return `${trimmed} Together they made a plan, learned from one another, and turned the challenge into a joyful discovery that changed tomorrow.`;
  }

  return `${trimmed} As they reflected on what had happened, they understood the lesson more deeply and used it to make wiser choices in the moments ahead.`;
}

function extractJsonPayload(rawText: string): string {
  const trimmed = rawText.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (fencedMatch?.[1]) {
    const fencedText = fencedMatch[1].trim();

    if (fencedText.startsWith('{') && fencedText.endsWith('}')) {
      return fencedText;
    }
  }

  const startIndex = trimmed.indexOf('{');
  const endIndex = trimmed.lastIndexOf('}');

  if (startIndex >= 0 && endIndex > startIndex) {
    return trimmed.slice(startIndex, endIndex + 1);
  }

  throw new Error('Groq did not return valid JSON.');
}

function normalizeCharacterDescriptions(parsedDraft: Partial<BookDraft & { characterDescriptions?: Record<string, string> }>): CharacterDescription[] {
  if (Array.isArray((parsedDraft as { characters?: unknown }).characters)) {
    return [];
  }
  return [];
}

function normalizeBookDraft(params: StoryGenerationParams, parsedDraft: Partial<BookDraft>, characterDescriptions: CharacterDescription[] = []): BookDraft {
  const pages = Array.isArray(parsedDraft.pages) ? parsedDraft.pages : [];
  const compactCharacterSheet = buildCompactCharacterSheet(characterDescriptions);

  const characterSheetPrefix = characterDescriptions.length > 0
    ? `[CHARACTER KEY: ${compactCharacterSheet}] `
    : '';

  const normalizedPages = Array.from({ length: params.pageCount }, (_, index) => {
    const page = pages[index];
    const rawText = typeof page?.text === 'string' ? page.text : '';
    const textBase = rawText.length > 0 ? rawText : `Page ${index + 1} of ${params.title.trim()}.`;

    return {
      pageNumber: index + 1,
      text: ensureReadablePageText(textBase, params.ageGroup),
      illustrationPrompt: (() => {
        const base =
          typeof page?.illustrationPrompt === 'string' && page.illustrationPrompt.trim().length > 0
            ? page.illustrationPrompt.trim()
            : `A vivid children's book illustration for page ${index + 1} of ${params.title.trim()}, warm lighting, expressive characters, age-appropriate scene.`;
        const withoutExistingPrefix = base.startsWith('[CHARACTER SHEET:') || base.startsWith('[CHARACTER KEY:')
          ? base
          : `${characterSheetPrefix}${base}`;
        return withoutExistingPrefix;
      })(),
    };
  });

  const normalizedCharacters = Array.isArray(parsedDraft.characters)
    ? parsedDraft.characters.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    : [];

  return {
    title: params.title.trim(),
    subtitle: typeof parsedDraft.subtitle === 'string' && parsedDraft.subtitle.trim().length > 0 ? parsedDraft.subtitle : 'A MindBloom book',
    theme: normalizeTheme(parsedDraft.theme),
    ageGroup: params.ageGroup,
    learningFocus: params.learningFocus,
    bookSize: params.bookSize,
    pageCount: params.pageCount,
    summary: typeof parsedDraft.summary === 'string' && parsedDraft.summary.trim().length > 0 ? parsedDraft.summary : params.storyIdea.trim(),
    readingLevel:
      typeof parsedDraft.readingLevel === 'string' && parsedDraft.readingLevel.trim().length > 0
        ? parsedDraft.readingLevel
        : 'Age-appropriate',
    artDirection:
      typeof parsedDraft.artDirection === 'string' && parsedDraft.artDirection.trim().length > 0
        ? parsedDraft.artDirection
        : 'Warm illustrated children\'s book pages',
    coverImagePrompt:
      typeof parsedDraft.coverImagePrompt === 'string' && parsedDraft.coverImagePrompt.trim().length > 0
        ? parsedDraft.coverImagePrompt
        : params.storyIdea.trim(),
    characters: normalizedCharacters.length > 0 ? normalizedCharacters : [params.title.trim()],
    pages: normalizedPages,
  };
}

async function createCompletionWithFallback<T>(factory: (model: string) => Promise<T>) {
  const models = getModelCandidates();
  let lastError: unknown;

  for (const model of models) {
    try {
      return await factory(model);
    } catch (error) {
      lastError = error;

      if (isFallbackEligibleError(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(`No accessible Groq model found. Tried: ${models.join(', ')}. Last error: ${getBestErrorMessage(lastError)}`);
}

function parseDraftFromResponse(responseText: string): Partial<BookDraft> {
  const jsonPayload = extractJsonPayload(responseText);

  return JSON.parse(jsonPayload) as Partial<BookDraft>;
}

export function buildPromptUsed(params: StoryGenerationParams): string {
  return buildBookPrompt(params, []);
}

export async function generateStoryOutline(params: StoryBuilderInput): Promise<StoryOutline> {
  const groq = getGroqClient();

  try {
    const completion = await createCompletionWithFallback((model) =>
      groq.chat.completions.create({
        model,
        temperature: 0.6,
        max_tokens: 2000,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(params.ageGroup),
          },
          {
            role: 'user',
            content: buildOutlinePrompt(params),
          },
        ],
      }),
    );

    const rawText = completion.choices[0]?.message?.content?.trim() ?? '';
    const jsonPayload = extractJsonPayload(rawText);
    const parsed = JSON.parse(jsonPayload) as Partial<StoryOutline>;

    return {
      title: params.title.trim(),
      subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle : 'A MindBloom book',
      summary: typeof parsed.summary === 'string' ? parsed.summary : params.storyIdea.trim(),
      theme: typeof parsed.theme === 'string' ? parsed.theme : 'Adventure',
      ageGroup: params.ageGroup,
      learningFocus: params.learningFocus,
      bookSize: params.bookSize,
      pageCount: params.pageCount,
      characters: Array.isArray(parsed.characters) ? (parsed.characters as CharacterDescription[]).filter(
        (c) => typeof c.name === 'string' && c.name.trim().length > 0,
      ) : [],
      pageOutlines: Array.isArray(parsed.pageOutlines)
        ? (parsed.pageOutlines as Array<{ pageNumber: number; title: string; summary: string }>)
        : Array.from({ length: params.pageCount }, (_, i) => ({
            pageNumber: i + 1,
            title: `Page ${i + 1}`,
            summary: '',
          })),
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create story outline';
    console.error('Groq outline creation error:', errorMsg, error);
    throw new Error(`Outline generation failed: ${errorMsg}`);
  }
}

export async function generateBookDraft(params: StoryGenerationParams, characterDescriptions: CharacterDescription[] = []): Promise<BookDraft> {
  const groq = getGroqClient();
  const tokenStrategies = [getBookMaxTokens(params.pageCount), 1200, 900];
  let lastError: unknown;

  for (const maxTokens of tokenStrategies) {
    try {
      const completion = await createCompletionWithFallback((model) =>
        groq.chat.completions.create({
          model,
          temperature: 0.7,
          max_tokens: maxTokens,
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(params.ageGroup),
            },
            {
              role: 'user',
              content: buildBookPrompt(params, characterDescriptions),
            },
          ],
        }),
      );

      const rawText = completion.choices[0]?.message?.content?.trim() ?? '';
      const parsedDraft = parseDraftFromResponse(rawText);

      return normalizeBookDraft(params, parsedDraft, characterDescriptions);
    } catch (error) {
      lastError = error;

      if (isFallbackEligibleError(error)) {
        continue;
      }

      break;
    }
  }

  const errorMsg = lastError instanceof Error ? lastError.message : 'Failed to create book draft';
  console.error('Groq book draft creation error:', errorMsg, lastError);
  throw new Error(`Story generation failed: ${errorMsg}`);
}

export async function generateStoryTitle(content: string): Promise<string> {
  const groq = getGroqClient();

  try {
    const completion = await createCompletionWithFallback((model) =>
      groq.chat.completions.create({
        model,
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
            content,
          },
        ],
      }),
    );

    const rawTitle = completion.choices[0]?.message?.content?.trim();
    const cleanedTitle = rawTitle?.replace(/^['\"]+|['\"]+$/g, '') ?? '';

    return cleanedTitle || 'A MindBloom Story';
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to create Groq title';
    console.error('Groq title creation error:', errorMsg, error);
    throw new Error(`Story title generation failed: ${errorMsg}`);
  }
}
