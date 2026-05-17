import 'server-only';

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { requireConfiguredValue } from '@/lib/service-config';
import {
  type SaveStoryInput,
  type Story,
  type StoryFilters,
  type StoryLikeRecord,
  type StoryRecord,
  type ToggleLikeResult,
} from '@/lib/types';
import { countWords } from '@/lib/utils';

function getSupabaseUrl() {
  return requireConfiguredValue('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, [
    'placeholder',
    'example.supabase.co',
  ]);
}

function getSupabaseAnonKey() {
  return requireConfiguredValue('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function getSupabaseServiceRoleKey() {
  return requireConfiguredValue('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const STORY_METADATA_PREFIX = '__MINDBLOOM_STORY_META__';

type LegacyStoryMetadata = {
  learningFocus?: SaveStoryInput['learningFocus'];
  bookSize?: SaveStoryInput['bookSize'];
  pageCount?: SaveStoryInput['pageCount'];
  bookPages?: SaveStoryInput['bookPages'];
  coverImageUrl?: SaveStoryInput['coverImageUrl'];
  isPublic?: SaveStoryInput['isPublic'];
};

function isLegacyStorySchemaError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    (message.includes('column') || message.includes('schema cache') || message.includes('could not find')) &&
    (
      message.includes('book_pages') ||
      message.includes('page_count') ||
      message.includes('learning_focus') ||
      message.includes('book_size') ||
      message.includes('cover_image_url') ||
      message.includes('is_public')
    )
  );
}

function encodeStoryMetadata(promptUsed: string | null | undefined, metadata: LegacyStoryMetadata) {
  const serializedMetadata = JSON.stringify(metadata);
  return `${STORY_METADATA_PREFIX}${serializedMetadata}\n${promptUsed ?? ''}`;
}

function decodeStoryMetadata(promptUsed: string | null | undefined) {
  if (!promptUsed?.startsWith(STORY_METADATA_PREFIX)) {
    return {
      promptUsed: promptUsed ?? null,
      metadata: null as LegacyStoryMetadata | null,
    };
  }

  const body = promptUsed.slice(STORY_METADATA_PREFIX.length);
  const newlineIndex = body.indexOf('\n');
  const serializedMetadata = newlineIndex >= 0 ? body.slice(0, newlineIndex) : body;
  const rawPromptUsed = newlineIndex >= 0 ? body.slice(newlineIndex + 1) : '';

  try {
    return {
      promptUsed: rawPromptUsed || null,
      metadata: JSON.parse(serializedMetadata) as LegacyStoryMetadata,
    };
  } catch {
    return {
      promptUsed: promptUsed ?? null,
      metadata: null as LegacyStoryMetadata | null,
    };
  }
}

function createServiceRoleClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapStory(record: StoryRecord, likeCount = 0, likedByCurrentUser = false): Story {
  const { promptUsed, metadata } = decodeStoryMetadata(record.prompt_used);

  return {
    id: record.id,
    userId: record.user_id,
    title: record.title,
    content: record.content,
    promptUsed,
    ageGroup: record.age_group,
    theme: record.theme,
    learningFocus: record.learning_focus ?? metadata?.learningFocus ?? null,
    bookSize: record.book_size ?? metadata?.bookSize ?? null,
    pageCount: record.page_count ?? metadata?.pageCount ?? null,
    bookPages: record.book_pages ?? metadata?.bookPages ?? null,
    characters: record.characters ?? [],
    wordCount: record.word_count ?? countWords(record.content),
    coverImageUrl: record.cover_image_url ?? metadata?.coverImageUrl ?? null,
    isPublic: typeof record.is_public === 'boolean' ? record.is_public : Boolean(metadata?.isPublic),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    likeCount,
    likedByCurrentUser,
  };
}

async function getLikeStatsByStoryIds(storyIds: string[], viewerUserId?: string) {
  const stats = new Map<string, { count: number; likedByCurrentUser: boolean }>();

  storyIds.forEach((storyId) => {
    stats.set(storyId, { count: 0, likedByCurrentUser: false });
  });

  if (storyIds.length === 0) {
    return stats;
  }

  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('story_likes')
    .select('story_id, user_id')
    .in('story_id', storyIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of (data ?? []) as Pick<StoryLikeRecord, 'story_id' | 'user_id'>[]) {
    const current = stats.get(row.story_id);

    if (!current) {
      continue;
    }

    current.count += 1;

    if (viewerUserId && row.user_id === viewerUserId) {
      current.likedByCurrentUser = true;
    }
  }

  return stats;
}

export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies during render.
        }
      },
    },
  });
}

export async function getStoryById(id: string, viewerUserId?: string): Promise<Story | null> {
  const client = createServiceRoleClient();
  const { data, error } = await client
    .from('stories')
    .select('*')
    .eq('id', id)
    .maybeSingle<StoryRecord>();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  if (!data.is_public && data.user_id !== viewerUserId) {
    return null;
  }

  const likeStats = await getLikeStatsByStoryIds([data.id], viewerUserId);
  const storyStats = likeStats.get(data.id);

  return mapStory(data, storyStats?.count ?? 0, storyStats?.likedByCurrentUser ?? false);
}

export async function getStoriesByUser(
  userId: string,
  filters: StoryFilters = {},
): Promise<Story[]> {
  const client = createServiceRoleClient();
  let query = client
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (filters.theme) {
    query = query.eq('theme', filters.theme);
  }

  if (filters.ageGroup) {
    query = query.eq('age_group', filters.ageGroup);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query.returns<StoryRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  const storyRows = data ?? [];
  const likeStats = await getLikeStatsByStoryIds(
    storyRows.map((story) => story.id),
    userId,
  );

  return storyRows.map((story) => {
    const stats = likeStats.get(story.id);
    return mapStory(story, stats?.count ?? 0, stats?.likedByCurrentUser ?? false);
  });
}

export async function saveStory(input: SaveStoryInput): Promise<Story> {
  const client = createServiceRoleClient();
  const payload = {
    user_id: input.userId,
    title: input.title,
    content: input.content,
    prompt_used: input.promptUsed ?? null,
    age_group: input.ageGroup,
    theme: input.theme,
    learning_focus: input.learningFocus ?? null,
    book_size: input.bookSize ?? null,
    page_count: input.pageCount ?? null,
    book_pages: input.bookPages ?? null,
    characters: input.characters,
    word_count: countWords(input.content),
    cover_image_url: input.coverImageUrl ?? null,
    is_public: input.isPublic ?? false,
  };

  let { data, error } = await client
    .from('stories')
    .insert(payload)
    .select('*')
    .single<StoryRecord>();

  if (error && isLegacyStorySchemaError(error)) {
    const legacyPayload = {
      user_id: input.userId,
      title: input.title,
      content: input.content,
      prompt_used: encodeStoryMetadata(input.promptUsed, {
        learningFocus: input.learningFocus ?? null,
        bookSize: input.bookSize ?? null,
        pageCount: input.pageCount ?? null,
        bookPages: input.bookPages ?? null,
        coverImageUrl: input.coverImageUrl ?? null,
        isPublic: input.isPublic ?? false,
      }),
      age_group: input.ageGroup,
      theme: input.theme,
      characters: input.characters,
      word_count: countWords(input.content),
    };

    ({ data, error } = await client
      .from('stories')
      .insert(legacyPayload)
      .select('*')
      .single<StoryRecord>());
  }

  if (error) {
    throw new Error(error.message);
  }

  return mapStory(data);
}

export async function updateStory(
  id: string,
  userId: string,
  updates: Partial<Omit<SaveStoryInput, 'userId'>>,
): Promise<Story> {
  const existingStory = await getStoryById(id, userId);

  if (!existingStory || existingStory.userId !== userId) {
    throw new Error('Story not found or access denied.');
  }

  const client = createServiceRoleClient();
  const payload: Partial<StoryRecord> = {};

  if (updates.title !== undefined) {
    payload.title = updates.title;
  }

  if (updates.content !== undefined) {
    payload.content = updates.content;
    payload.word_count = countWords(updates.content);
  }

  if (updates.promptUsed !== undefined) {
    payload.prompt_used = updates.promptUsed;
  }

  if (updates.ageGroup !== undefined) {
    payload.age_group = updates.ageGroup;
  }

  if (updates.theme !== undefined) {
    payload.theme = updates.theme;
  }

  if (updates.learningFocus !== undefined) {
    payload.learning_focus = updates.learningFocus;
  }

  if (updates.bookSize !== undefined) {
    payload.book_size = updates.bookSize;
  }

  if (updates.pageCount !== undefined) {
    payload.page_count = updates.pageCount;
  }

  if (updates.bookPages !== undefined) {
    payload.book_pages = updates.bookPages;
  }

  if (updates.characters !== undefined) {
    payload.characters = updates.characters;
  }

  if (updates.coverImageUrl !== undefined) {
    payload.cover_image_url = updates.coverImageUrl;
  }

  if (updates.isPublic !== undefined) {
    payload.is_public = updates.isPublic;
  }

  let { data, error } = await client
    .from('stories')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single<StoryRecord>();

  if (error && isLegacyStorySchemaError(error)) {
    const mergedPromptUsed = updates.promptUsed !== undefined ? updates.promptUsed : existingStory.promptUsed;
    const legacyPayload: Partial<StoryRecord> = {
      prompt_used: encodeStoryMetadata(mergedPromptUsed, {
        learningFocus: updates.learningFocus !== undefined ? updates.learningFocus : existingStory.learningFocus,
        bookSize: updates.bookSize !== undefined ? updates.bookSize : existingStory.bookSize,
        pageCount: updates.pageCount !== undefined ? updates.pageCount : existingStory.pageCount,
        bookPages: updates.bookPages !== undefined ? updates.bookPages : existingStory.bookPages,
        coverImageUrl: updates.coverImageUrl !== undefined ? updates.coverImageUrl : existingStory.coverImageUrl,
        isPublic: updates.isPublic !== undefined ? updates.isPublic : existingStory.isPublic,
      }),
    };

    if (updates.title !== undefined) {
      legacyPayload.title = updates.title;
    }

    if (updates.content !== undefined) {
      legacyPayload.content = updates.content;
      legacyPayload.word_count = countWords(updates.content);
    }

    if (updates.ageGroup !== undefined) {
      legacyPayload.age_group = updates.ageGroup;
    }

    if (updates.theme !== undefined) {
      legacyPayload.theme = updates.theme;
    }

    if (updates.characters !== undefined) {
      legacyPayload.characters = updates.characters;
    }

    ({ data, error } = await client
      .from('stories')
      .update(legacyPayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single<StoryRecord>());
  }

  if (error) {
    throw new Error(error.message);
  }

  const likeStats = await getLikeStatsByStoryIds([data.id], userId);
  const stats = likeStats.get(data.id);

  return mapStory(data, stats?.count ?? 0, stats?.likedByCurrentUser ?? false);
}

export async function deleteStory(id: string, userId: string): Promise<void> {
  const client = createServiceRoleClient();
  const { error } = await client.from('stories').delete().eq('id', id).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function toggleLike(storyId: string, userId: string): Promise<ToggleLikeResult> {
  const story = await getStoryById(storyId, userId);

  if (!story) {
    throw new Error('Story not found or access denied.');
  }

  const client = createServiceRoleClient();
  const { data: existingLike, error: existingLikeError } = await client
    .from('story_likes')
    .select('id')
    .eq('story_id', storyId)
    .eq('user_id', userId)
    .maybeSingle<{ id: string }>();

  if (existingLikeError) {
    throw new Error(existingLikeError.message);
  }

  let liked = false;

  if (existingLike?.id) {
    const { error } = await client.from('story_likes').delete().eq('id', existingLike.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await client.from('story_likes').insert({
      story_id: storyId,
      user_id: userId,
    });

    if (error) {
      throw new Error(error.message);
    }

    liked = true;
  }

  const likeStats = await getLikeStatsByStoryIds([storyId], userId);
  const stats = likeStats.get(storyId);

  return {
    liked,
    likeCount: stats?.count ?? 0,
  };
}

export async function getPublicStories(options: {
  query?: string;
  sort?: 'latest' | 'top';
  limit?: number;
  theme?: string;
  ageGroup?: string;
} = {}): Promise<Story[]> {
  const client = createServiceRoleClient();
  let dbQuery = client
    .from('stories')
    .select('*')
    .eq('is_public', true);

  if (options.theme) {
    dbQuery = dbQuery.eq('theme', options.theme);
  }

  if (options.ageGroup) {
    dbQuery = dbQuery.eq('age_group', options.ageGroup);
  }

  if (options.query) {
    dbQuery = dbQuery.or(`title.ilike.%${options.query}%,content.ilike.%${options.query}%`);
  }

  if (options.sort === 'top') {
    dbQuery = dbQuery.order('like_count', { ascending: false });
  } else {
    dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  dbQuery = dbQuery.limit(options.limit ?? 50);

  const { data, error } = await dbQuery.returns<StoryRecord[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((story) => mapStory(story));
}
