-- ============================================
-- Picnic Design Lab — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Flow overrides: stores edits to flow name, description, and spec
create table if not exists flow_overrides (
  flow_id text primary key,
  name text,
  description text,
  spec text,
  updated_at timestamptz default now()
);

-- Screen overrides: stores edits to screen title and description
create table if not exists screen_overrides (
  id bigint generated always as identity primary key,
  flow_id text not null,
  screen_id text not null,
  title text,
  description text,
  updated_at timestamptz default now(),
  unique (flow_id, screen_id)
);

-- Token overrides: stores edits to design tokens
create table if not exists token_overrides (
  css_var text primary key,
  value text not null,
  updated_at timestamptz default now()
);

-- Flow graphs: stores the node+edge graph for the flow view
create table if not exists flow_graphs (
  flow_id text primary key,
  nodes text not null,
  edges text not null,
  updated_at timestamptz default now()
);

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

-- ============================================
-- Row Level Security
-- Allow all for anon key (single-user design tool)
-- ============================================

alter table flow_overrides enable row level security;
alter table screen_overrides enable row level security;
alter table token_overrides enable row level security;
alter table flow_graphs enable row level security;
alter table dynamic_flows enable row level security;
alter table dynamic_pages enable row level security;
alter table flow_groups enable row level security;
alter table page_overrides enable row level security;

-- Policies: allow all operations for anon
create policy "Allow all on flow_overrides" on flow_overrides
  for all using (true) with check (true);

create policy "Allow all on screen_overrides" on screen_overrides
  for all using (true) with check (true);

create policy "Allow all on token_overrides" on token_overrides
  for all using (true) with check (true);

create policy "Allow all on flow_graphs" on flow_graphs
  for all using (true) with check (true);

create policy "Allow all on dynamic_flows" on dynamic_flows
  for all using (true) with check (true);

create policy "Allow all on dynamic_pages" on dynamic_pages
  for all using (true) with check (true);

create policy "Allow all on flow_groups" on flow_groups
  for all using (true) with check (true);

create policy "Allow all on page_overrides" on page_overrides
  for all using (true) with check (true);

-- ============================================
-- Realtime
-- ============================================

alter publication supabase_realtime add table flow_overrides;
alter publication supabase_realtime add table screen_overrides;
alter publication supabase_realtime add table token_overrides;
alter publication supabase_realtime add table flow_graphs;
alter publication supabase_realtime add table dynamic_flows;
alter publication supabase_realtime add table dynamic_pages;
alter publication supabase_realtime add table flow_groups;
alter publication supabase_realtime add table page_overrides;
