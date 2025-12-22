-- Enable PostGIS for potential future use (optional but recommended for trees)
create extension if not exists "postgis";

-- TREES TABLE
create table public.trees (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  especie text not null,
  data date not null,
  dap numeric,
  altura numeric,
  observacoes text,
  localizacao geometry(Point, 4326), -- Optional, using PostGIS
  user_id uuid references auth.users(id) default auth.uid()
);

-- RLS for TREES
alter table public.trees enable row level security;

create policy "Users can view all trees"
on public.trees for select
to authenticated
using (true);

create policy "Users can insert their own trees"
on public.trees for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own trees"
on public.trees for update
to authenticated
using (auth.uid() = user_id);

-- TASKS TABLE
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')) default 'PENDING',
  priority text check (priority in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) default 'MEDIUM',
  type text not null, -- Intervention Type
  description text,
  tree_id uuid references public.trees(id) not null,
  assigned_to uuid references auth.users(id),
  completed_at timestamp with time zone,
  notes text,
  evidence_url text
);

-- RLS for TASKS
alter table public.tasks enable row level security;

create policy "Users can view assigned tasks"
on public.tasks for select
to authenticated
using (true); -- Simplified for now, allows seeing all tasks. Ideal: (auth.uid() = assigned_to)

create policy "Users can update assigned tasks"
on public.tasks for update
to authenticated
using (auth.uid() = assigned_to or auth.uid() = (select user_id from public.trees where id = tree_id));
