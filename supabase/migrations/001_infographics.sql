-- Mekalin Visual Engine V2: infographics table
-- Run via: supabase db push  OR  paste into Supabase SQL editor

create table if not exists public.infographics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  title           text not null,
  raw_input       text not null,
  visual_mode     text not null
                    check (visual_mode in ('causal_chain', 'functional_anatomy', 'procedural_map')),
  structured_data jsonb,
  frame_count     integer not null default 1
                    check (frame_count between 1 and 7),
  status          text not null default 'queued'
                    check (status in ('queued', 'processing', 'complete', 'error')),
  png_urls        text[] not null default '{}',
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger infographics_updated_at
  before update on public.infographics
  for each row execute function public.set_updated_at();

alter table public.infographics enable row level security;

create policy "anon_insert" on public.infographics
  for insert with check (true);

create policy "owner_select" on public.infographics
  for select using (auth.uid() = user_id or user_id is null);

create policy "owner_update" on public.infographics
  for update using (auth.uid() = user_id);

create index if not exists idx_infographics_user_id   on public.infographics (user_id);
create index if not exists idx_infographics_status    on public.infographics (status);
create index if not exists idx_infographics_created   on public.infographics (created_at desc);
