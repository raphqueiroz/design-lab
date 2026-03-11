-- Canvas comments: design canvas annotations per flow (singleton JSON per flow)
create table if not exists canvas_comments (
  flow_id text primary key,
  comments text not null default '[]',
  updated_at timestamptz default now()
);

alter table canvas_comments enable row level security;

create policy "Allow all on canvas_comments" on canvas_comments
  for all using (true) with check (true);

alter publication supabase_realtime add table canvas_comments;
