export enum AgeGroup {
  EARLY = '3-5',
  MIDDLE = '6-8',
  OLDER = '9-12',
}

export enum StoryTheme {
  ADVENTURE = 'Adventure',
  FANTASY = 'Fantasy',
  ANIMALS = 'Animals',
  SCIENCE = 'Science',
  FRIENDSHIP = 'Friendship',
  MYSTERY = 'Mystery',
}

export interface Profile {
  id: string;
  clerkUserId: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  title: string;
  content: string;
  promptUsed: string | null;
  ageGroup: AgeGroup;
  theme: StoryTheme;
  characters: string[];
  wordCount: number;
  coverImageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  likedByCurrentUser?: boolean;
}

export interface StoryRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  prompt_used: string | null;
  age_group: AgeGroup;
  theme: StoryTheme;
  characters: string[] | null;
  word_count: number | null;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryLikeRecord {
  id: string;
  story_id: string;
  user_id: string;
  created_at: string;
}

export interface StoryFormInput {
  theme: StoryTheme;
  ageGroup: AgeGroup;
  mainCharacter: string;
  setting: string;
  specialElement?: string;
}

export interface StoryGenerationParams extends StoryFormInput {}

export interface SaveStoryInput {
  userId: string;
  title: string;
  content: string;
  promptUsed?: string | null;
  ageGroup: AgeGroup;
  theme: StoryTheme;
  characters: string[];
  coverImageUrl?: string | null;
  isPublic?: boolean;
}

export interface ToggleLikeResult {
  liked: boolean;
  likeCount: number;
}

export interface StoryFilters {
  theme?: StoryTheme;
  ageGroup?: AgeGroup;
  limit?: number;
}

export const AGE_GROUP_OPTIONS = [
  {
    value: AgeGroup.EARLY,
    label: 'Ages 3-5',
    guidance: '300-600 words with gentle repetition, soothing rhythm, and simple sentence structure.',
  },
  {
    value: AgeGroup.MIDDLE,
    label: 'Ages 6-8',
    guidance: '500-900 words with richer vocabulary, playful dialogue, and a clear emotional arc.',
  },
  {
    value: AgeGroup.OLDER,
    label: 'Ages 9-12',
    guidance: '800-1400 words with deeper world-building, stronger stakes, and chapter-like pacing.',
  },
] as const;

export const STORY_THEME_OPTIONS = [
  { value: StoryTheme.ADVENTURE, label: 'Adventure' },
  { value: StoryTheme.FANTASY, label: 'Fantasy' },
  { value: StoryTheme.ANIMALS, label: 'Animals' },
  { value: StoryTheme.SCIENCE, label: 'Science' },
  { value: StoryTheme.FRIENDSHIP, label: 'Friendship' },
  { value: StoryTheme.MYSTERY, label: 'Mystery' },
] as const;
