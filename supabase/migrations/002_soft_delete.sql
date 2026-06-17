-- Soft delete para produtos (lixeira)
alter table products add column if not exists deleted_at timestamptz default null;
