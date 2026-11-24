-- =====================================================================
-- Kala & Karsa — setup Supabase
-- Jalankan sekali di: Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

-- 1) Daftar email admin ---------------------------------------------
create table if not exists public.admins (
  email text primary key
);

-- GANTI dengan email akun admin yang akan kamu buat di Authentication > Users
insert into public.admins (email) values ('emailkamu@contoh.com')
on conflict (email) do nothing;

-- 2) Tabel produk & ruangan -----------------------------------------
create table if not exists public.products (
  id             bigint primary key,
  name           text not null,
  category       text,
  price          numeric default 0,
  stock          integer default 0,
  description    text,
  sku            text,
  material       text,
  color          text,
  dimension      text,
  weight         text,
  warranty       text,
  features       jsonb default '[]'::jsonb,
  image_url      text,
  transparent_bg boolean default true,
  sort           integer default 0,
  updated_at     timestamptz default now()
);

create table if not exists public.scenes (
  id         text primary key,
  label      text not null,
  grp        text default 'indoor',
  image_url  text,
  hotspots   jsonb default '[]'::jsonb,
  sort       integer default 0,
  updated_at timestamptz default now()
);

-- 3) Fungsi cek admin (security definer agar tidak rekursif di RLS) ---
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- 4) Row Level Security ----------------------------------------------
alter table public.admins   enable row level security;
alter table public.products enable row level security;
alter table public.scenes   enable row level security;

drop policy if exists "admin lihat dirinya"     on public.admins;
drop policy if exists "publik baca produk"      on public.products;
drop policy if exists "admin kelola produk"     on public.products;
drop policy if exists "publik baca ruangan"     on public.scenes;
drop policy if exists "admin kelola ruangan"    on public.scenes;

create policy "admin lihat dirinya" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "publik baca produk" on public.products
  for select to anon, authenticated using (true);

create policy "admin kelola produk" on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "publik baca ruangan" on public.scenes
  for select to anon, authenticated using (true);

create policy "admin kelola ruangan" on public.scenes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5) Storage untuk foto produk & ruangan ------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "publik baca foto"  on storage.objects;
drop policy if exists "admin unggah foto" on storage.objects;
drop policy if exists "admin ubah foto"   on storage.objects;
drop policy if exists "admin hapus foto"  on storage.objects;

create policy "publik baca foto" on storage.objects
  for select to anon, authenticated using (bucket_id = 'images');

create policy "admin unggah foto" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());

create policy "admin ubah foto" on storage.objects
  for update to authenticated
  using (bucket_id = 'images' and public.is_admin());

create policy "admin hapus foto" on storage.objects
  for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());
