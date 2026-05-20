-- ════════════════════════════════════════════════════════════
-- SUPABASE SYSTEM TABLE FOR ALL PORTFOLIO DATA (CMS CLOUD)
-- ════════════════════════════════════════════════════════════
-- Exécutez cette requête dans votre SQL Editor sur Supabase
-- pour activer la synchronisation de tout votre site (Projets, Market, Expérience, etc.) !

create table if not exists portfolio_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Règles de sécurité (RLS) pour autoriser l'accès public en lecture et écriture
alter table portfolio_data enable row level security;
create policy "Allow public read portfolio_data" on portfolio_data for select using (true);
create policy "Allow public insert portfolio_data" on portfolio_data for insert with check (true);
create policy "Allow public update portfolio_data" on portfolio_data for update using (true);
create policy "Allow public delete portfolio_data" on portfolio_data for delete using (true);
