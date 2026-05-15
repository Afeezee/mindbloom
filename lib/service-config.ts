import 'server-only';

function hasConfiguredValue(value: string | undefined, invalidFragments: string[] = ['placeholder']) {
  if (!value) {
    return false;
  }

  const normalizedValue = value.toLowerCase();

  return !invalidFragments.some((fragment) => normalizedValue.includes(fragment.toLowerCase()));
}

export function requireConfiguredValue(
  name: string,
  value: string | undefined,
  invalidFragments?: string[],
): string {
  const configuredValue = value;

  if (!configuredValue || !hasConfiguredValue(configuredValue, invalidFragments)) {
    throw new Error(`${name} is not configured.`);
  }

  return configuredValue;
}

export const isGroqConfigured = hasConfiguredValue(process.env.GROQ_API_KEY);

export const groqSetupMessage =
  'Add a real GROQ_API_KEY to .env.local and restart the app to enable story generation and automatic titles.';

export const isSupabaseConfigured =
  hasConfiguredValue(process.env.NEXT_PUBLIC_SUPABASE_URL, ['placeholder', 'example.supabase.co']) &&
  hasConfiguredValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  hasConfiguredValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const supabaseSetupMessage =
  'Add real NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY values to .env.local and restart the app to enable story storage, reads, and likes.';