-- Maricota DB Schema

create table if not exists categories (
  id text primary key,
  label text not null,
  color text default '#8A9A7E',
  fixed boolean default false,
  position int default 0
);

create table if not exists products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text references categories(id) on delete set null,
  det text,
  price text,
  fabric text,
  wa text,
  featured boolean default false,
  images text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists carousel_slots (
  id serial primary key,
  position int not null,
  type text not null, -- 'product' | 'category'
  ref_id text not null,
  label text
);

create table if not exists especiais_slots (
  id serial primary key,
  position int not null,
  type text not null,
  ref_id text not null,
  label text
);

create table if not exists settings (
  key text primary key,
  value jsonb
);

-- Default categories
insert into categories (id, label, color, fixed, position) values
  ('bichinhos', 'Bichinho', '#8A9A7E', true, 0),
  ('roupinhas', 'Roupinha', '#B89A5E', true, 1),
  ('porta', 'Porta Maternidade', '#C0685A', true, 2)
on conflict (id) do nothing;

-- Default settings
insert into settings (key, value) values
  ('wa_number', '"5599999999999"'),
  ('admin_name', '"Aladiane"'),
  ('appearance', '{"brand":"#6B7A58","brandL":"#8A9A75","brandP":"#EAF0E3","sec":"#F3F3EC","pill":"#F7F6F1","accent":"#8A9A7E"}')
on conflict (key) do nothing;

-- RLS: products and categories are public read
alter table products enable row level security;
alter table categories enable row level security;
alter table carousel_slots enable row level security;
alter table especiais_slots enable row level security;
alter table settings enable row level security;

create policy "public read products" on products for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read carousel" on carousel_slots for select using (true);
create policy "public read especiais" on especiais_slots for select using (true);
create policy "public read settings" on settings for select using (true);

-- Writes only via service_role (server-side API routes)
create policy "service write products" on products for all using (auth.role() = 'service_role');
create policy "service write categories" on categories for all using (auth.role() = 'service_role');
create policy "service write carousel" on carousel_slots for all using (auth.role() = 'service_role');
create policy "service write especiais" on especiais_slots for all using (auth.role() = 'service_role');
create policy "service write settings" on settings for all using (auth.role() = 'service_role');

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('maricota', 'maricota', true)
on conflict (id) do nothing;

create policy "public read storage" on storage.objects for select using (bucket_id = 'maricota');
create policy "service upload storage" on storage.objects for insert with check (bucket_id = 'maricota' and auth.role() = 'service_role');
create policy "service delete storage" on storage.objects for delete using (bucket_id = 'maricota' and auth.role() = 'service_role');
