begin;

alter table public.stories
  add column if not exists learning_focus text,
  add column if not exists book_size text,
  add column if not exists page_count integer,
  add column if not exists book_pages jsonb;

create index if not exists stories_learning_focus_idx on public.stories (learning_focus);

commit;