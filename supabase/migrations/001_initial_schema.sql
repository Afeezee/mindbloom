begin;

create extension if not exists pgcrypto;

create or replace function public.requesting_clerk_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'sub', ''),
    nullif(auth.jwt() ->> 'clerk_user_id', '')
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  clerk_user_id text unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  content text not null,
  prompt_used text,
  age_group text check (age_group in ('3-5', '6-8', '9-12')),
  theme text check (theme in ('Adventure', 'Fantasy', 'Animals', 'Science', 'Friendship', 'Mystery')),
  characters text[] not null default '{}',
  word_count integer,
  cover_image_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.story_likes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  user_id text not null,
  created_at timestamptz not null default now(),
  unique (story_id, user_id)
);

create index if not exists stories_user_id_idx on public.stories (user_id);
create index if not exists stories_theme_idx on public.stories (theme);
create index if not exists stories_age_group_idx on public.stories (age_group);
create index if not exists stories_is_public_idx on public.stories (is_public);
create index if not exists story_likes_story_id_idx on public.story_likes (story_id);
create index if not exists story_likes_user_id_idx on public.story_likes (user_id);

drop trigger if exists set_stories_updated_at on public.stories;
create trigger set_stories_updated_at
before update on public.stories
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.stories enable row level security;
alter table public.story_likes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (clerk_user_id = public.requesting_clerk_user_id());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (clerk_user_id = public.requesting_clerk_user_id());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (clerk_user_id = public.requesting_clerk_user_id())
with check (clerk_user_id = public.requesting_clerk_user_id());

drop policy if exists "stories_select_public_or_own" on public.stories;
create policy "stories_select_public_or_own"
on public.stories
for select
using (
  is_public = true
  or user_id = public.requesting_clerk_user_id()
);

drop policy if exists "stories_insert_own" on public.stories;
create policy "stories_insert_own"
on public.stories
for insert
with check (user_id = public.requesting_clerk_user_id());

drop policy if exists "stories_update_own" on public.stories;
create policy "stories_update_own"
on public.stories
for update
using (user_id = public.requesting_clerk_user_id())
with check (user_id = public.requesting_clerk_user_id());

drop policy if exists "stories_delete_own" on public.stories;
create policy "stories_delete_own"
on public.stories
for delete
using (user_id = public.requesting_clerk_user_id());

drop policy if exists "story_likes_select_own" on public.story_likes;
create policy "story_likes_select_own"
on public.story_likes
for select
using (user_id = public.requesting_clerk_user_id());

drop policy if exists "story_likes_insert_own" on public.story_likes;
create policy "story_likes_insert_own"
on public.story_likes
for insert
with check (
  user_id = public.requesting_clerk_user_id()
  and exists (
    select 1
    from public.stories
    where stories.id = story_likes.story_id
      and (
        stories.is_public = true
        or stories.user_id = public.requesting_clerk_user_id()
      )
  )
);

drop policy if exists "story_likes_delete_own" on public.story_likes;
create policy "story_likes_delete_own"
on public.story_likes
for delete
using (user_id = public.requesting_clerk_user_id());

commit;
