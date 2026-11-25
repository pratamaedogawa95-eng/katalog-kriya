-- US-32 (aktif/nonaktif), US-47 (urutan tampil), US-40/41 (klik WhatsApp + terlaris).
-- Jalankan di Supabase SQL Editor SEBELUM deploy kode baru. Aman dijalankan ulang.
alter table public.produk add column if not exists aktif boolean not null default true;
alter table public.produk add column if not exists urutan integer not null default 0 check (urutan between 0 and 9999);

create table if not exists public.klik_wa (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists klik_wa_produk_idx on public.klik_wa (produk_id, created_at);
alter table public.klik_wa enable row level security;
drop policy if exists "admin_baca_klik" on public.klik_wa;
-- Hanya admin yang boleh membaca. Pencatatan dilakukan server dengan kunci rahasia (tanpa izin publik).
create policy "admin_baca_klik" on public.klik_wa for select to authenticated using (true);
