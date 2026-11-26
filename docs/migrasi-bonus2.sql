-- K-12 (rate limit di database), US-43 (pengaturan toko), US-45 (log admin), US-18 (foto tambahan).
-- Jalankan di Supabase SQL Editor SEBELUM deploy kode baru. Aman dijalankan ulang.

-- US-18: foto tambahan produk (maksimal 5 link, divalidasi di server)
alter table public.produk add column if not exists foto_tambahan text[] not null default '{}';

-- US-43: pengaturan toko (satu baris, id = 1)
create table if not exists public.pengaturan_toko (
  id integer primary key default 1 check (id = 1),
  nama text, tagline text, deskripsi text, alamat text, jam_buka text, nomor_whatsapp text,
  promo_teks text, promo_label text, promo_tautan text,
  diubah_pada timestamptz not null default now()
);
alter table public.pengaturan_toko enable row level security;
drop policy if exists "admin_baca_pengaturan" on public.pengaturan_toko;
drop policy if exists "admin_tambah_pengaturan" on public.pengaturan_toko;
drop policy if exists "admin_ubah_pengaturan" on public.pengaturan_toko;
create policy "admin_baca_pengaturan" on public.pengaturan_toko for select to authenticated using (true);
create policy "admin_tambah_pengaturan" on public.pengaturan_toko for insert to authenticated with check (true);
create policy "admin_ubah_pengaturan" on public.pengaturan_toko for update to authenticated using (true) with check (true);

-- US-45: log aktivitas admin (email diisi otomatis dari login)
create table if not exists public.log_admin (
  id bigint generated always as identity primary key,
  email text default (auth.jwt() ->> 'email'),
  aksi text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists log_admin_waktu_idx on public.log_admin (created_at desc);
alter table public.log_admin enable row level security;
drop policy if exists "admin_baca_log" on public.log_admin;
drop policy if exists "admin_tambah_log" on public.log_admin;
create policy "admin_baca_log" on public.log_admin for select to authenticated using (true);
create policy "admin_tambah_log" on public.log_admin for insert to authenticated with check (true);

-- K-12: pembatas laju yang tidak ter-reset di Vercel. Hanya bisa dipanggil server (kunci rahasia).
create table if not exists public.batas_laju (
  kunci text primary key,
  jumlah integer not null,
  mulai timestamptz not null default now()
);
alter table public.batas_laju enable row level security;  -- tanpa policy: tidak bisa diakses lewat API publik

create or replace function public.cek_batas(p_kunci text, p_maks integer, p_ms integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_jumlah integer;
begin
  insert into public.batas_laju as b (kunci, jumlah, mulai) values (p_kunci, 1, now())
  on conflict (kunci) do update set
    jumlah = case when b.mulai < now() - make_interval(secs => p_ms / 1000.0) then 1 else b.jumlah + 1 end,
    mulai  = case when b.mulai < now() - make_interval(secs => p_ms / 1000.0) then now() else b.mulai end
  returning jumlah into v_jumlah;
  if random() < 0.02 then delete from public.batas_laju where mulai < now() - interval '1 day'; end if;
  return v_jumlah <= p_maks;
end $$;
revoke all on function public.cek_batas(text, integer, integer) from public, anon, authenticated;
grant execute on function public.cek_batas(text, integer, integer) to service_role;
