-- Hardening nao destrutivo: constraints leves, indices e substituicao transacional de slots.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'carousel_slots_type_check'
  ) then
    alter table carousel_slots
      add constraint carousel_slots_type_check
      check (type in ('product', 'category')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'especiais_slots_type_check'
  ) then
    alter table especiais_slots
      add constraint especiais_slots_type_check
      check (type in ('product', 'category')) not valid;
  end if;
end $$;

create index if not exists products_category_idx on products (category);
create index if not exists products_deleted_at_idx on products (deleted_at);
create index if not exists products_created_at_idx on products (created_at desc);
create index if not exists carousel_slots_position_idx on carousel_slots (position);
create index if not exists especiais_slots_position_idx on especiais_slots (position);

create or replace function replace_carousel_slots(slots jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(slots) <> 'array' then
    raise exception 'slots must be an array';
  end if;

  delete from carousel_slots;

  insert into carousel_slots (position, type, ref_id, label)
  select
    ordinality - 1,
    item->>'type',
    item->>'ref_id',
    nullif(item->>'label', '')
  from jsonb_array_elements(slots) with ordinality as entries(item, ordinality);
end;
$$;

create or replace function replace_especiais_slots(slots jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if jsonb_typeof(slots) <> 'array' then
    raise exception 'slots must be an array';
  end if;

  delete from especiais_slots;

  insert into especiais_slots (position, type, ref_id, label)
  select
    ordinality - 1,
    item->>'type',
    item->>'ref_id',
    nullif(item->>'label', '')
  from jsonb_array_elements(slots) with ordinality as entries(item, ordinality);
end;
$$;
