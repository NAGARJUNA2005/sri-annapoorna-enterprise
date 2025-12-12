-- Supabase schema for Sri Annapoorna
create table if not exists otps (
  phone text primary key,
  otp text,
  ts bigint
);

create table if not exists verified (
  phone text primary key,
  ts bigint
);

create table if not exists orders (
  id text primary key,
  name text,
  phone text,
  notes text,
  items jsonb,
  total numeric,
  ts bigint
);
