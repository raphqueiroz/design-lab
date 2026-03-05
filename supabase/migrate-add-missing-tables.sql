-- ============================================
-- Migration: Add missing tables
-- Run this in your Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Dynamic flows: user-created flows with placeholder screens
create table if not exists dynamic_flows (
  id text primary key,
  name text not null,
  description text not null default '',
  domain text not null default 'uncategorized',
  screens text not null default '[]',
  spec_content text,
  updated_at timestamptz default now()
);

-- Dynamic pages: user-created standalone pages
create table if not exists dynamic_pages (
  id text primary key,
  name text not null,
  description text not null default '',
  area text not null default 'Uncategorized',
  components_used text not null default '[]',
  updated_at timestamptz default now()
);

-- Flow groups: sidebar grouping/ordering (singleton row)
create table if not exists flow_groups (
  id text primary key,
  data text not null default '{}',
  updated_at timestamptz default now()
);

-- Page overrides: stores name/description edits for registered pages
create table if not exists page_overrides (
  page_id text primary key,
  name text,
  description text,
  updated_at timestamptz default now()
);

-- RLS + policies for new tables
alter table dynamic_flows enable row level security;
alter table dynamic_pages enable row level security;
alter table flow_groups enable row level security;
alter table page_overrides enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'dynamic_flows' and policyname = 'Allow all on dynamic_flows') then
    create policy "Allow all on dynamic_flows" on dynamic_flows for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'dynamic_pages' and policyname = 'Allow all on dynamic_pages') then
    create policy "Allow all on dynamic_pages" on dynamic_pages for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'flow_groups' and policyname = 'Allow all on flow_groups') then
    create policy "Allow all on flow_groups" on flow_groups for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'page_overrides' and policyname = 'Allow all on page_overrides') then
    create policy "Allow all on page_overrides" on page_overrides for all using (true) with check (true);
  end if;
end $$;

-- Realtime for new tables (safe: Postgres ignores duplicates)
alter publication supabase_realtime add table dynamic_flows;
alter publication supabase_realtime add table dynamic_pages;
alter publication supabase_realtime add table flow_groups;
alter publication supabase_realtime add table page_overrides;
