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

export enum LearningFocus {
  MORAL_VALUES = 'Moral & Values',
  FINANCIAL_LITERACY = 'Financial Literacy',
  MENTAL_HEALTH = 'Mental Health',
  CAREER_AWARENESS = 'Career Awareness',
  COMMUNICATION = 'Communication',
  OTHER_TOPICS = 'Other Topics',
}

export enum BookSize {
  A5_PORTRAIT = 'A5 Portrait',
  A4_PORTRAIT = 'A4 Portrait',
  US_LETTER = 'US Letter',
}

export interface CharacterDescription {
  name: string;
  role: string;
  appearance: string;
}

export interface StoryPageDraft {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  imageUrl?: string;
}

export interface PageOutline {
  pageNumber: number;
  title: string;
  summary: string;
}

export interface StoryOutline {
  title: string;
  subtitle: string;
  summary: string;
  theme: string;
  ageGroup: AgeGroup;
  learningFocus: LearningFocus;
  bookSize: BookSize;
  pageCount: number;
  characters: CharacterDescription[];
  pageOutlines: PageOutline[];
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
  learningFocus: LearningFocus | null;
  bookSize: BookSize | null;
  pageCount: number | null;
  bookPages?: StoryPageDraft[] | null;
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
  learning_focus: LearningFocus | null;
  book_size: BookSize | null;
  page_count: number | null;
  book_pages: StoryPageDraft[] | null;
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

export interface StoryBuilderInput {
  title: string;
  storyIdea: string;
  pageCount: number;
  ageGroup: AgeGroup;
  learningFocus: LearningFocus;
  bookSize: BookSize;
}

export interface StoryGenerationParams extends StoryBuilderInput {}

export interface BookDraft {
  title: string;
  subtitle: string;
  theme: StoryTheme;
  ageGroup: AgeGroup;
  learningFocus: LearningFocus;
  bookSize: BookSize;
  pageCount: number;
  summary: string;
  readingLevel: string;
  artDirection: string;
  coverImagePrompt: string;
  characters: string[];
  pages: StoryPageDraft[];
}

export interface SaveStoryInput {
  userId: string;
  title: string;
  content: string;
  promptUsed?: string | null;
  ageGroup: AgeGroup;
  theme: StoryTheme;
  learningFocus?: LearningFocus | null;
  bookSize?: BookSize | null;
  pageCount?: number | null;
  bookPages?: StoryPageDraft[] | null;
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
  learningFocus?: LearningFocus;
  limit?: number;
}

export const AGE_GROUP_OPTIONS = [
  {
    value: AgeGroup.EARLY,
    label: '3-5 years early learners',
    guidance: 'Best for short, comforting stories with simple sentence structure and gentle repetition.',
  },
  {
    value: AgeGroup.MIDDLE,
    label: '6-8 years growing minds',
    guidance: 'Best for stories with richer vocabulary, clear lessons, playful dialogue, and stronger plots.',
  },
  {
    value: AgeGroup.OLDER,
    label: '9-12 years independent reader',
    guidance: 'Best for longer stories with deeper world-building, stronger stakes, and chapter-like pacing.',
  },
] as const;

export const LEARNING_FOCUS_OPTIONS = [
  { value: LearningFocus.MORAL_VALUES, label: 'Moral & Values' },
  { value: LearningFocus.FINANCIAL_LITERACY, label: 'Financial Literacy' },
  { value: LearningFocus.MENTAL_HEALTH, label: 'Mental Health' },
  { value: LearningFocus.CAREER_AWARENESS, label: 'Career Awareness' },
  { value: LearningFocus.COMMUNICATION, label: 'Communication' },
  { value: LearningFocus.OTHER_TOPICS, label: 'Other Topics' },
] as const;

export const BOOK_SIZE_OPTIONS = [
  { value: BookSize.A5_PORTRAIT, label: 'A5 Portrait' },
  { value: BookSize.A4_PORTRAIT, label: 'A4 Portrait' },
  { value: BookSize.US_LETTER, label: 'US Letter' },
] as const;

export const BOOK_LENGTH_PRESETS = [
  { value: 12, label: 'Quick Story', description: 'Faster, focused, easy to finish in one sitting.' },
  { value: 24, label: 'Standard', description: 'Balanced pacing for a fuller illustrated book.' },
  { value: 50, label: 'Epic Adventure', description: 'A longer book with room for a richer journey.' },
] as const;

export const STORY_THEME_OPTIONS = [
  { value: StoryTheme.ADVENTURE, label: 'Adventure' },
  { value: StoryTheme.FANTASY, label: 'Fantasy' },
  { value: StoryTheme.ANIMALS, label: 'Animals' },
  { value: StoryTheme.SCIENCE, label: 'Science' },
  { value: StoryTheme.FRIENDSHIP, label: 'Friendship' },
  { value: StoryTheme.MYSTERY, label: 'Mystery' },
] as const;
