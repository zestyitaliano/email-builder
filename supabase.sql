-- Profiles --------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  company text,
  avatar_url text,
  updated_at timestamptz default timezone('utc', now()) not null
);

alter table public.profiles enable row level security;

create policy "Profiles are readable by owners" on public.profiles
for select using (auth.uid() = id);

create policy "Profiles are insertable by owners" on public.profiles
for insert with check (auth.uid() = id);

create policy "Profiles are updatable by owners" on public.profiles
for update using (auth.uid() = id);

-- Templates -------------------------------------------------------------
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  subject text,
  status text default 'draft',
  html text,
  builder_tree jsonb default '[]'::jsonb,
  canvas_state jsonb,
  updated_at timestamptz default timezone('utc', now()) not null,
  inserted_at timestamptz default timezone('utc', now()) not null
);

alter table public.templates enable row level security;

create policy "Users read their templates" on public.templates
for select using (auth.uid() = user_id);

create policy "Users write their templates" on public.templates
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Assets ---------------------------------------------------------------
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  url text,
  created_at timestamptz default timezone('utc', now()) not null
);

alter table public.assets enable row level security;

create policy "Users read their assets" on public.assets
for select using (auth.uid() = user_id);

create policy "Users write their assets" on public.assets
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage bucket with RLS ----------------------------------------------
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

create policy "Public asset reads" on storage.objects
for select using (bucket_id = 'assets');

create policy "Only owners write assets" on storage.objects
for insert with check (bucket_id = 'assets' and auth.uid() = owner);

create policy "Only owners update assets" on storage.objects
for update using (bucket_id = 'assets' and auth.uid() = owner);

create policy "Only owners delete assets" on storage.objects
for delete using (bucket_id = 'assets' and auth.uid() = owner);
