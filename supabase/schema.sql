-- Caretaker AI — database contract for the React dashboard (PRD / cursorrules).
-- Run once in Supabase: Dashboard → SQL → New query → paste → Run.
-- Uses auth.users(id) as manager_id (same as Supabase Auth user id).

begin;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location text,
  property_type text default 'residential',
  number_of_units integer not null default 1
    check (number_of_units >= 0),
  expected_monthly_revenue numeric,
  created_at timestamptz not null default now()
);

create index if not exists properties_manager_id_idx on public.properties (manager_id);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  full_name text not null,
  phone text,
  unit text,
  annual_service_charge numeric,
  caution_deposit numeric,
  lease_start_date date,
  lease_expiry_date date,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists tenants_manager_id_idx on public.tenants (manager_id);
create index if not exists tenants_property_id_idx on public.tenants (property_id);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  trade text,
  phone text,
  email text,
  notes text,
  status text not null default 'available',
  assigned_properties text,
  rating numeric,
  created_at timestamptz not null default now()
);

create index if not exists vendors_manager_id_idx on public.vendors (manager_id);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  property_id uuid references public.properties (id) on delete set null,
  tenant_id uuid references public.tenants (id) on delete set null,
  vendor_id uuid references public.vendors (id) on delete set null,
  type text,
  status text not null default 'open',
  priority text default 'medium',
  description text,
  activity_log jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  resolved_at timestamptz,
  job_cost numeric,
  job_notes text,
  maintenance_cost numeric
);

create index if not exists complaints_manager_id_idx on public.complaints (manager_id);
create index if not exists complaints_vendor_id_idx on public.complaints (vendor_id);
create index if not exists complaints_property_id_idx on public.complaints (property_id);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  amount numeric,
  status text,
  due_date date,
  reference text,
  created_at timestamptz not null default now()
);

create index if not exists invoices_manager_id_idx on public.invoices (manager_id);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  amount numeric,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists payments_manager_id_idx on public.payments (manager_id);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  unit_number text,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists units_property_id_idx on public.units (property_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.properties enable row level security;
alter table public.tenants enable row level security;
alter table public.vendors enable row level security;
alter table public.complaints enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.units enable row level security;

-- Properties
drop policy if exists "properties_select" on public.properties;
drop policy if exists "properties_insert" on public.properties;
drop policy if exists "properties_update" on public.properties;
drop policy if exists "properties_delete" on public.properties;
create policy "properties_select" on public.properties for select using (manager_id = auth.uid());
create policy "properties_insert" on public.properties for insert with check (manager_id = auth.uid());
create policy "properties_update" on public.properties for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "properties_delete" on public.properties for delete using (manager_id = auth.uid());

-- Tenants
drop policy if exists "tenants_select" on public.tenants;
drop policy if exists "tenants_insert" on public.tenants;
drop policy if exists "tenants_update" on public.tenants;
drop policy if exists "tenants_delete" on public.tenants;
create policy "tenants_select" on public.tenants for select using (manager_id = auth.uid());
create policy "tenants_insert" on public.tenants for insert with check (manager_id = auth.uid());
create policy "tenants_update" on public.tenants for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "tenants_delete" on public.tenants for delete using (manager_id = auth.uid());

-- Vendors
drop policy if exists "vendors_select" on public.vendors;
drop policy if exists "vendors_insert" on public.vendors;
drop policy if exists "vendors_update" on public.vendors;
drop policy if exists "vendors_delete" on public.vendors;
create policy "vendors_select" on public.vendors for select using (manager_id = auth.uid());
create policy "vendors_insert" on public.vendors for insert with check (manager_id = auth.uid());
create policy "vendors_update" on public.vendors for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "vendors_delete" on public.vendors for delete using (manager_id = auth.uid());

-- Complaints
drop policy if exists "complaints_select" on public.complaints;
drop policy if exists "complaints_insert" on public.complaints;
drop policy if exists "complaints_update" on public.complaints;
drop policy if exists "complaints_delete" on public.complaints;
create policy "complaints_select" on public.complaints for select using (manager_id = auth.uid());
create policy "complaints_insert" on public.complaints for insert with check (manager_id = auth.uid());
create policy "complaints_update" on public.complaints for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "complaints_delete" on public.complaints for delete using (manager_id = auth.uid());

-- Invoices
drop policy if exists "invoices_select" on public.invoices;
drop policy if exists "invoices_insert" on public.invoices;
drop policy if exists "invoices_update" on public.invoices;
drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_select" on public.invoices for select using (manager_id = auth.uid());
create policy "invoices_insert" on public.invoices for insert with check (manager_id = auth.uid());
create policy "invoices_update" on public.invoices for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "invoices_delete" on public.invoices for delete using (manager_id = auth.uid());

-- Payments
drop policy if exists "payments_select" on public.payments;
drop policy if exists "payments_insert" on public.payments;
drop policy if exists "payments_update" on public.payments;
drop policy if exists "payments_delete" on public.payments;
create policy "payments_select" on public.payments for select using (manager_id = auth.uid());
create policy "payments_insert" on public.payments for insert with check (manager_id = auth.uid());
create policy "payments_update" on public.payments for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "payments_delete" on public.payments for delete using (manager_id = auth.uid());

-- Units (scoped via owning property)
drop policy if exists "units_select" on public.units;
drop policy if exists "units_insert" on public.units;
drop policy if exists "units_update" on public.units;
drop policy if exists "units_delete" on public.units;
create policy "units_select" on public.units for select using (
  exists (
    select 1 from public.properties p
    where p.id = units.property_id and p.manager_id = auth.uid()
  )
);
create policy "units_insert" on public.units for insert with check (
  exists (
    select 1 from public.properties p
    where p.id = property_id and p.manager_id = auth.uid()
  )
);
create policy "units_update" on public.units for update using (
  exists (
    select 1 from public.properties p
    where p.id = units.property_id and p.manager_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.properties p
    where p.id = property_id and p.manager_id = auth.uid()
  )
);
create policy "units_delete" on public.units for delete using (
  exists (
    select 1 from public.properties p
    where p.id = units.property_id and p.manager_id = auth.uid()
  )
);

-- If complaints already existed without triage columns, add them:
alter table public.complaints add column if not exists priority text default 'medium';
alter table public.complaints add column if not exists activity_log jsonb default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- Payments / inbox / broadcast (PRD §8.5–8.7) — run after core tables exist
-- ---------------------------------------------------------------------------

alter table public.invoices add column if not exists tenant_confirmation text;
alter table public.invoices add column if not exists confirmation_at timestamptz;
alter table public.invoices add column if not exists pdf_url text;
alter table public.invoices add column if not exists issued_at timestamptz;

create table if not exists public.receipts (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  invoice_id uuid references public.invoices (id) on delete set null,
  amount numeric,
  payment_date date,
  sent_at timestamptz not null default now(),
  reference text,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index if not exists receipts_manager_id_idx on public.receipts (manager_id);

create table if not exists public.inbox_threads (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid references public.tenants (id) on delete set null,
  last_message_preview text,
  last_message_at timestamptz not null default now(),
  unread_count integer not null default 0,
  ai_active boolean not null default true,
  thread_status text not null default 'open'
);

create index if not exists inbox_threads_manager_id_idx on public.inbox_threads (manager_id);

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.inbox_threads (id) on delete cascade,
  body text not null,
  direction text not null default 'inbound',
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists inbox_messages_thread_id_idx on public.inbox_messages (thread_id);

create table if not exists public.broadcast_logs (
  id uuid primary key default gen_random_uuid(),
  manager_id uuid not null references auth.users (id) on delete cascade,
  template_key text,
  body_preview text,
  recipient_count integer not null default 0,
  scheduled_for timestamptz,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

create index if not exists broadcast_logs_manager_id_idx on public.broadcast_logs (manager_id);

alter table public.receipts enable row level security;
alter table public.inbox_threads enable row level security;
alter table public.inbox_messages enable row level security;
alter table public.broadcast_logs enable row level security;

drop policy if exists "receipts_select" on public.receipts;
drop policy if exists "receipts_insert" on public.receipts;
drop policy if exists "receipts_update" on public.receipts;
drop policy if exists "receipts_delete" on public.receipts;
create policy "receipts_select" on public.receipts for select using (manager_id = auth.uid());
create policy "receipts_insert" on public.receipts for insert with check (manager_id = auth.uid());
create policy "receipts_update" on public.receipts for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "receipts_delete" on public.receipts for delete using (manager_id = auth.uid());

drop policy if exists "inbox_threads_select" on public.inbox_threads;
drop policy if exists "inbox_threads_insert" on public.inbox_threads;
drop policy if exists "inbox_threads_update" on public.inbox_threads;
drop policy if exists "inbox_threads_delete" on public.inbox_threads;
create policy "inbox_threads_select" on public.inbox_threads for select using (manager_id = auth.uid());
create policy "inbox_threads_insert" on public.inbox_threads for insert with check (manager_id = auth.uid());
create policy "inbox_threads_update" on public.inbox_threads for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "inbox_threads_delete" on public.inbox_threads for delete using (manager_id = auth.uid());

drop policy if exists "inbox_messages_select" on public.inbox_messages;
drop policy if exists "inbox_messages_insert" on public.inbox_messages;
drop policy if exists "inbox_messages_update" on public.inbox_messages;
drop policy if exists "inbox_messages_delete" on public.inbox_messages;
create policy "inbox_messages_select" on public.inbox_messages for select using (
  exists (
    select 1 from public.inbox_threads t
    where t.id = inbox_messages.thread_id and t.manager_id = auth.uid()
  )
);
create policy "inbox_messages_insert" on public.inbox_messages for insert with check (
  exists (
    select 1 from public.inbox_threads t
    where t.id = thread_id and t.manager_id = auth.uid()
  )
);
create policy "inbox_messages_update" on public.inbox_messages for update using (
  exists (
    select 1 from public.inbox_threads t
    where t.id = inbox_messages.thread_id and t.manager_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.inbox_threads t
    where t.id = thread_id and t.manager_id = auth.uid()
  )
);
create policy "inbox_messages_delete" on public.inbox_messages for delete using (
  exists (
    select 1 from public.inbox_threads t
    where t.id = inbox_messages.thread_id and t.manager_id = auth.uid()
  )
);

drop policy if exists "broadcast_logs_select" on public.broadcast_logs;
drop policy if exists "broadcast_logs_insert" on public.broadcast_logs;
drop policy if exists "broadcast_logs_update" on public.broadcast_logs;
drop policy if exists "broadcast_logs_delete" on public.broadcast_logs;
create policy "broadcast_logs_select" on public.broadcast_logs for select using (manager_id = auth.uid());
create policy "broadcast_logs_insert" on public.broadcast_logs for insert with check (manager_id = auth.uid());
create policy "broadcast_logs_update" on public.broadcast_logs for update using (manager_id = auth.uid()) with check (manager_id = auth.uid());
create policy "broadcast_logs_delete" on public.broadcast_logs for delete using (manager_id = auth.uid());

commit;
