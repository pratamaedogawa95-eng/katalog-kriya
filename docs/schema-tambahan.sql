-- Tambahan untuk ruang display, simulasi, dan stok. Jalankan di Supabase > SQL Editor setelah schema.sql. Aman dijalankan ulang.
alter table public.produk add column if not exists stok integer not null default 10 check (stok >= 0);

create table if not exists public.ruangan (
  id bigint generated always as identity primary key,
  nama text not null,
  jenis text not null check (jenis in ('indoor','outdoor')),
  foto_url text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.tanda (
  id bigint generated always as identity primary key,
  ruangan_id bigint not null references public.ruangan(id) on delete cascade,
  produk_id bigint not null references public.produk(id) on delete cascade,
  x numeric not null check (x between 0 and 100),
  y numeric not null check (y between 0 and 100)
);

alter table public.ruangan enable row level security;
alter table public.tanda enable row level security;
drop policy if exists "admin_ruangan" on public.ruangan;
drop policy if exists "admin_tanda" on public.tanda;
create policy "admin_ruangan" on public.ruangan for all to authenticated using (true) with check (true);
create policy "admin_tanda" on public.tanda for all to authenticated using (true) with check (true);

insert into public.ruangan (nama, jenis, foto_url)
select * from (values
  ('Ruang Tamu', 'indoor', '/ruangan/ruang-tamu.svg'),
  ('Teras', 'outdoor', '/ruangan/teras.svg')
) as v (nama, jenis, foto_url)
where not exists (select 1 from public.ruangan);

-- Tanda (+) contoh diisi oleh docs/migrasi-furnitur.sql (setelah produk furnitur tersedia).
