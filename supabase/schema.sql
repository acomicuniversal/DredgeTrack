-- DredgeTrack production schema. Run once in Supabase SQL Editor.
create extension if not exists "uuid-ossp";

create table if not exists projects (
  id text primary key, name text not null, created_at timestamptz default now()
);
insert into projects (id, name) values ('north-channel', 'North Channel Project') on conflict do nothing;

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text, role text not null default 'operator' check (role in ('admin','manager','operator','viewer')),
  created_at timestamptz default now()
);
create table if not exists vessels (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), name text not null,
  vessel_type text, status text default 'standby', zone text, created_at timestamptz default now()
);
create table if not exists crew_members (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), full_name text not null,
  role text, vessel_id uuid references vessels(id), certification_expiry date, status text default 'active'
);
create table if not exists shift_logs (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), vessel_id uuid references vessels(id),
  shift_date date default current_date, shift text, production_m3 numeric default 0, fuel_l numeric default 0, notes text,
  status text default 'submitted', submitted_by uuid references auth.users, created_at timestamptz default now()
);
create table if not exists dredge_zones (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), name text not null,
  geometry jsonb, target_m3 numeric, actual_m3 numeric default 0, status text default 'planned'
);
create table if not exists maintenance_orders (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), vessel_id uuid references vessels(id),
  title text not null, priority text default 'medium', status text default 'open', due_date date, details text, created_at timestamptz default now()
);
create table if not exists fuel_transactions (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), vessel_id uuid references vessels(id),
  quantity_l numeric not null, transaction_type text check (transaction_type in ('receipt','issue')), recorded_at timestamptz default now(), notes text
);
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), name text not null, file_type text,
  storage_path text, size_bytes bigint, status text default 'review', imported_by uuid references auth.users, created_at timestamptz default now()
);
create table if not exists approvals (
  id uuid primary key default uuid_generate_v4(), project_id text references projects(id), record_type text not null, record_id uuid,
  title text not null, status text default 'pending' check (status in ('pending','approved','rejected')), requested_by uuid references auth.users,
  approved_by uuid references auth.users, approved_at timestamptz, created_at timestamptz default now()
);

alter table projects enable row level security; alter table profiles enable row level security; alter table vessels enable row level security;
alter table crew_members enable row level security; alter table shift_logs enable row level security; alter table dredge_zones enable row level security;
alter table maintenance_orders enable row level security; alter table fuel_transactions enable row level security; alter table documents enable row level security; alter table approvals enable row level security;

-- Replace these starter policies with project membership policies before production use.
create policy "authenticated project access" on vessels for all to authenticated using (true) with check (true);
create policy "authenticated project access" on crew_members for all to authenticated using (true) with check (true);
create policy "authenticated project access" on shift_logs for all to authenticated using (true) with check (true);
create policy "authenticated project access" on dredge_zones for all to authenticated using (true) with check (true);
create policy "authenticated project access" on maintenance_orders for all to authenticated using (true) with check (true);
create policy "authenticated project access" on fuel_transactions for all to authenticated using (true) with check (true);
create policy "authenticated project access" on documents for all to authenticated using (true) with check (true);
create policy "authenticated project access" on approvals for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('operational-documents', 'operational-documents', false) on conflict do nothing;
create policy "authenticated document upload" on storage.objects for insert to authenticated with check (bucket_id = 'operational-documents');
create policy "authenticated document read" on storage.objects for select to authenticated using (bucket_id = 'operational-documents');

