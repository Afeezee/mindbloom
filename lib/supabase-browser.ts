import { createBrowserClient } from '@supabase/ssr';

function getBrowserSupabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!value) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  }

  return value;
}

function getBrowserSupabaseAnonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.');
  }

  return value;
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(getBrowserSupabaseUrl(), getBrowserSupabaseAnonKey());
}