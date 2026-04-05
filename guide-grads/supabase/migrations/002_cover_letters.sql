-- Cover letters: one row per resume, keyed by resume_id (JSON payload in app shape).

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint cover_letters_resume_id_key unique (resume_id)
);

create index if not exists cover_letters_user_id_idx on public.cover_letters (user_id);

alter table public.cover_letters enable row level security;

create policy "cover_letters_select_own" on public.cover_letters
  for select using (auth.uid() = user_id);

create policy "cover_letters_insert_own" on public.cover_letters
  for insert with check (auth.uid() = user_id);

create policy "cover_letters_update_own" on public.cover_letters
  for update using (auth.uid() = user_id);

create policy "cover_letters_delete_own" on public.cover_letters
  for delete using (auth.uid() = user_id);

-- Optional: copy nested fields from legacy resumes.payload (safe if table already had rows).
insert into public.cover_letters (user_id, resume_id, payload, updated_at)
select
  r.user_id,
  r.id,
  jsonb_build_object(
    'coverLetter', r.payload->'coverLetter',
    'coverLetterCustomize', r.payload->'coverLetterCustomize',
    'updatedAt', (r.payload->'updatedAt')
  ),
  now()
from public.resumes r
where (r.payload ? 'coverLetter' and r.payload->'coverLetter' is not null and r.payload->'coverLetter' <> 'null'::jsonb)
   or (r.payload ? 'coverLetterCustomize' and r.payload->'coverLetterCustomize' is not null)
on conflict (resume_id) do nothing;
