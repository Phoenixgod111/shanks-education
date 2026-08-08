begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 48),
  grade smallint check (grade between 5 and 11),
  study_goal text,
  prefs_schema_version smallint not null default 3 check (prefs_schema_version >= 1),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_selections (
  user_id uuid not null references auth.users(id) on delete cascade,
  grade smallint not null check (grade between 5 and 11),
  subject_id text not null check (subject_id ~ '^[a-z0-9_-]{1,64}$'),
  textbook_id text check (textbook_id is null or textbook_id ~ '^[a-z0-9_-]{1,128}$'),
  trajectory_version text check (trajectory_version is null or char_length(trajectory_version) between 1 and 32),
  current_topic_id text check (current_topic_id is null or char_length(current_topic_id) between 1 and 128),
  selected boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, grade, subject_id)
);

create table public.topic_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null check (subject_id ~ '^[a-z0-9_-]{1,64}$'),
  grade smallint not null check (grade between 5 and 11),
  topic_id text not null check (char_length(topic_id) between 1 and 128),
  progress jsonb not null default '{}'::jsonb check (jsonb_typeof(progress) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id, grade, topic_id)
);

create table public.lesson_positions (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null check (subject_id ~ '^[a-z0-9_-]{1,64}$'),
  grade smallint not null check (grade between 5 and 11),
  topic_id text not null check (char_length(topic_id) between 1 and 128),
  lesson_id text not null check (char_length(lesson_id) between 1 and 128),
  position jsonb not null default '{}'::jsonb check (jsonb_typeof(position) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id, grade, topic_id, lesson_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null check (event_name ~ '^[a-z0-9_.-]{1,80}$'),
  properties jsonb not null default '{}'::jsonb check (jsonb_typeof(properties) = 'object'),
  occurred_at timestamptz not null default now()
);

create index events_user_occurred_at_idx on public.events (user_id, occurred_at desc);

create table public.subject_votes (
  user_id uuid primary key references auth.users(id) on delete cascade,
  subject_id text not null check (subject_id ~ '^[a-z0-9_-]{1,64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger learning_selections_set_updated_at
before update on public.learning_selections
for each row execute function public.set_updated_at();

create trigger topic_progress_set_updated_at
before update on public.topic_progress
for each row execute function public.set_updated_at();

create trigger lesson_positions_set_updated_at
before update on public.lesson_positions
for each row execute function public.set_updated_at();

create trigger subject_votes_set_updated_at
before update on public.subject_votes
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.learning_selections enable row level security;
alter table public.topic_progress enable row level security;
alter table public.lesson_positions enable row level security;
alter table public.events enable row level security;
alter table public.subject_votes enable row level security;

create policy "profiles_select_own" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles
for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles
for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles
for delete to authenticated using ((select auth.uid()) = id);

create policy "learning_selections_select_own" on public.learning_selections
for select to authenticated using ((select auth.uid()) = user_id);
create policy "learning_selections_insert_own" on public.learning_selections
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "learning_selections_update_own" on public.learning_selections
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "learning_selections_delete_own" on public.learning_selections
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "topic_progress_select_own" on public.topic_progress
for select to authenticated using ((select auth.uid()) = user_id);
create policy "topic_progress_insert_own" on public.topic_progress
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "topic_progress_update_own" on public.topic_progress
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "topic_progress_delete_own" on public.topic_progress
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "lesson_positions_select_own" on public.lesson_positions
for select to authenticated using ((select auth.uid()) = user_id);
create policy "lesson_positions_insert_own" on public.lesson_positions
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "lesson_positions_update_own" on public.lesson_positions
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lesson_positions_delete_own" on public.lesson_positions
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "events_select_own" on public.events
for select to authenticated using ((select auth.uid()) = user_id);
create policy "events_insert_own" on public.events
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "events_delete_own" on public.events
for delete to authenticated using ((select auth.uid()) = user_id);

create policy "subject_votes_select_own" on public.subject_votes
for select to authenticated using ((select auth.uid()) = user_id);
create policy "subject_votes_insert_own" on public.subject_votes
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "subject_votes_update_own" on public.subject_votes
for update to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "subject_votes_delete_own" on public.subject_votes
for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.learning_selections to authenticated;
grant select, insert, update, delete on public.topic_progress to authenticated;
grant select, insert, update, delete on public.lesson_positions to authenticated;
grant select, insert, delete on public.events to authenticated;
grant select, insert, update, delete on public.subject_votes to authenticated;

commit;
