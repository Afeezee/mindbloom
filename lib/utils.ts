import { type ClassValue, clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { AgeGroup, BookSize, LearningFocus } from '@/lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function getAgeGroupLabel(ageGroup: AgeGroup): string {
  switch (ageGroup) {
    case AgeGroup.EARLY:
      return '3-5 years early learners';
    case AgeGroup.MIDDLE:
      return '6-8 years growing minds';
    case AgeGroup.OLDER:
      return '9-12 years independent reader';
    default:
      return ageGroup;
  }
}

export function getLearningFocusLabel(learningFocus: LearningFocus): string {
  return learningFocus;
}

export function getBookSizeLabel(bookSize: BookSize): string {
  return bookSize;
}

export function getBookLengthLabel(pageCount: number): string {
  if (pageCount <= 16) {
    return 'Quick Story';
  }

  if (pageCount <= 32) {
    return 'Standard';
  }

  return 'Epic Adventure';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
