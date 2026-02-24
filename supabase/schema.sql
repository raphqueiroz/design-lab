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

-- Enable Row Level Security (but allow all for anon — this is a design tool, not user-facing)
alter table flow_overrides enable row level security;
alter table screen_overrides enable row level security;
alter table token_overrides enable row level security;
alter table flow_graphs enable row level security;

-- Allow all operations for the anon key (single-user design tool)
create policy "Allow all on flow_overrides" on flow_overrides
  for all using (true) with check (true);

create policy "Allow all on screen_overrides" on screen_overrides
  for all using (true) with check (true);

create policy "Allow all on token_overrides" on token_overrides
  for all using (true) with check (true);

create policy "Allow all on flow_graphs" on flow_graphs
  for all using (true) with check (true);

-- Enable realtime for all tables
alter publication supabase_realtime add table flow_overrides;
alter publication supabase_realtime add table screen_overrides;
alter publication supabase_realtime add table token_overrides;
alter publication supabase_realtime add table flow_graphs;
