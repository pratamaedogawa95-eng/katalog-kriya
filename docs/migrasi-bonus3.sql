-- US-29 (upload foto), US-48 (varian harga), US-38/39 (ulasan + moderasi).
-- Jalankan di Supabase SQL Editor SEBELUM deploy kode baru. Aman dijalankan ulang.

-- US-29: bucket foto publik (hanya jpg/png/webp, maks 4 MB). Unggah dilakukan server dengan kunci rahasia.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produk-foto', 'produk-foto', true, 4194304, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- US-48: varian harga per ukuran, mis. [{"nama":"120 cm","harga":1650000}] (divalidasi di server, maks 8)
alter table public.produk add column if not exists varian jsonb not null default '[]'::jsonb;

-- US-38/39: ulasan. Pengunjung mengirim lewat server (kunci rahasia); status awal "menunggu".
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null check (char_length(nama) between 1 and 40),
  rating integer not null check (rating between 1 and 5),
  isi text not null check (char_length(isi) between 10 and 600),
  status text not null default 'menunggu' check (status in ('menunggu','tampil','ditolak')),
  created_at timestamptz not null default now()
);
create index if not exists ulasan_produk_idx on public.ulasan (produk_id, status, created_at desc);
alter table public.ulasan enable row level security;
drop policy if exists "admin_baca_ulasan" on public.ulasan;
drop policy if exists "admin_ubah_ulasan" on public.ulasan;
drop policy if exists "admin_hapus_ulasan" on public.ulasan;
create policy "admin_baca_ulasan" on public.ulasan for select to authenticated using (true);
create policy "admin_ubah_ulasan" on public.ulasan for update to authenticated using (true) with check (true);
create policy "admin_hapus_ulasan" on public.ulasan for delete to authenticated using (true);
