-- Migrasi ke katalog furnitur & prabotan handmade (indoor dan outdoor).
-- Jalankan di Supabase > SQL Editor SETELAH schema.sql dan schema-tambahan.sql. Aman dijalankan ulang:
--   * kolom spesifikasi ditambahkan jika belum ada
--   * produk dengan nama yang sama hanya DIPERBARUI spesifikasinya (harga, foto, stok, dan deskripsimu tidak diubah)
--   * produk yang belum ada akan ditambahkan
-- PENTING: angka bahan, dimensi, dan berat di bawah adalah CONTOH. Sesuaikan dengan produk aslimu lewat /admin.

alter table public.produk add column if not exists stok integer not null default 10 check (stok >= 0);
alter table public.produk add column if not exists bahan text;
alter table public.produk add column if not exists finishing text;
alter table public.produk add column if not exists warna text;
alter table public.produk add column if not exists panjang_cm integer check (panjang_cm > 0);
alter table public.produk add column if not exists lebar_cm integer check (lebar_cm > 0);
alter table public.produk add column if not exists tinggi_cm integer check (tinggi_cm > 0);
alter table public.produk add column if not exists berat_kg numeric(6,1) check (berat_kg > 0);
alter table public.produk add column if not exists penggunaan text check (penggunaan in ('indoor','outdoor','indoor-outdoor'));
alter table public.produk add column if not exists garansi text;
alter table public.produk add column if not exists perawatan text;
alter table public.produk add column if not exists waktu_pembuatan text;
alter table public.produk add column if not exists harga_coret integer check (harga_coret >= 0);
alter table public.produk add column if not exists badge text;

with data (nama, kategori, harga, stok, deskripsi, foto_url, bahan, finishing, warna, p, l, t, berat, penggunaan, garansi, perawatan, waktu, coret, badge) as (values
  ('Kursi Halaman Depan', 'Kursi', 620000, 10, 'Kursi teras berbahan kayu jati dengan sandaran miring yang nyaman untuk duduk santai di halaman depan.', '/produk/kursi.svg',
   'Kayu jati kelas I, sambungan pen dan lem kayu', 'Teak oil tahan cuaca, 2 lapis', 'Natural jati', 55, 58, 90, 7.5, 'outdoor', 'Garansi 1 tahun untuk sambungan dan struktur', 'Lap dengan kain lembap. Oles teak oil tiap 6 bulan bila di luar ruangan.', '7–10 hari kerja', null, null),
  ('Meja Halaman Depan', 'Meja', 1650000, 10, 'Meja teras persegi panjang dari kayu jati dengan celah papan untuk drainase air hujan.', '/produk/meja.svg',
   'Kayu jati kelas I, rangka solid', 'Teak oil tahan cuaca, 2 lapis', 'Natural jati', 120, 60, 75, 22.0, 'outdoor', 'Garansi 1 tahun untuk sambungan dan struktur', 'Lap dengan kain lembap. Oles teak oil tiap 6 bulan.', '10–14 hari kerja', null, null),
  ('Kursi Taman Anyam', 'Kursi', 720000, 10, 'Kursi taman dengan anyaman rotan sintetis dan rangka besi hollow berlapis cat bakar anti karat.', '/produk/kursi.svg',
   'Rangka besi hollow 25 mm, anyaman rotan sintetis (PE)', 'Cat bakar powder coating', 'Cokelat tua', 58, 62, 85, 5.8, 'outdoor', 'Garansi 6 bulan untuk rangka dan anyaman', 'Sikat lembut dan air sabun. Hindari pelarut keras.', '7–10 hari kerja', 780000, 'Hemat'),
  ('Meja Taman Anyam', 'Meja', 1850000, 10, 'Meja bundar dengan top kaca tempered 8 mm dan kaki anyaman rotan sintetis, pasangan Kursi Taman Anyam.', '/produk/meja.svg',
   'Rangka besi hollow, anyaman rotan sintetis (PE), kaca tempered 8 mm', 'Cat bakar powder coating', 'Cokelat tua', 90, 90, 72, 14.5, 'outdoor', 'Garansi 6 bulan untuk rangka dan anyaman (kaca tidak termasuk)', 'Lap kaca dengan pembersih kaca. Anyaman disikat lembut.', '10–14 hari kerja', null, null),
  ('Kursi Makan Kayu Jati', 'Kursi', 650000, 10, 'Kursi makan dengan sandaran lurus dan dudukan lebar, cocok dipadukan dengan meja makan jati.', '/produk/kursi.svg',
   'Kayu jati kelas I, sambungan pen', 'Melamine doff, 3 lapis', 'Natural jati', 45, 50, 90, 6.0, 'indoor', 'Garansi 1 tahun untuk sambungan dan struktur', 'Lap kering atau lembap. Hindari air menggenang di kaki kursi.', '7–10 hari kerja', null, null),
  ('Meja Makan Kayu Jati', 'Meja', 3250000, 10, 'Meja makan untuk 6 orang dengan top jati solid setebal 4 cm. Dibuat tangan dari papan utuh tanpa sambungan di tengah.', '/produk/meja.svg',
   'Kayu jati kelas I, top solid tebal 4 cm', 'Melamine doff, 3 lapis', 'Natural jati', 160, 80, 75, 48.0, 'indoor', 'Garansi 2 tahun untuk struktur', 'Gunakan alas panas. Lap dengan kain lembap, poles tiap 1 tahun.', '14–21 hari kerja', 3500000, 'Terlaris'),
  ('Sofa Kulit Coklat Klasik', 'Sofa', 4850000, 10, 'Sofa 2 dudukan berkerangka kayu mahoni dengan busa high-density dan pelapis kulit sintetis premium.', '/produk/sofa.svg',
   'Rangka kayu mahoni, busa high-density 32 kg/m³, kulit sintetis (PU)', 'Jahitan tangan, kancing tarik', 'Cokelat tua', 165, 85, 80, 38.0, 'indoor', 'Garansi 2 tahun untuk rangka, 1 tahun untuk busa', 'Lap kulit dengan kain lembap. Jauhkan dari sinar matahari langsung.', '14–21 hari kerja', null, null),
  ('Kursi Lengan Putih Minimalis', 'Kursi', 1450000, 10, 'Kursi lengan bergaya minimalis dengan kaki kayu jati dan dudukan berlapis kain linen putih gading.', '/produk/kursi.svg',
   'Rangka mahoni, kaki jati, busa 28 kg/m³, kain linen', 'Kaki: clear doff', 'Putih gading', 70, 72, 82, 9.5, 'indoor', 'Garansi 1 tahun untuk rangka', 'Sikat kain secara berkala. Noda dibersihkan dengan kain lembap, jangan digosok.', '10–14 hari kerja', null, 'Baru'),
  ('Lemari Pakaian Jati 2 Pintu', 'Lemari & Rak', 5900000, 5, 'Lemari pakaian dua pintu dengan satu laci dan rak gantung. Pintu berengsel kuningan dan relief ukir sederhana.', '/produk/lemari.svg',
   'Kayu jati kelas I, panel solid, engsel kuningan', 'Melamine doff, 3 lapis', 'Natural jati', 100, 55, 190, 85.0, 'indoor', 'Garansi 2 tahun untuk struktur dan engsel', 'Lap kering. Letakkan silica gel di dalam lemari untuk mencegah lembap.', '21–30 hari kerja', 6400000, 'Hemat'),
  ('Rak Buku Minimalis 5 Susun', 'Lemari & Rak', 1750000, 8, 'Rak buku terbuka lima susun dengan rangka mahoni, beban per rak hingga 20 kg.', '/produk/lemari.svg',
   'Kayu mahoni, papan setebal 2,5 cm', 'Clear doff, 2 lapis', 'Cokelat natural', 80, 30, 180, 24.0, 'indoor', 'Garansi 1 tahun untuk struktur', 'Lap kering. Jangan melebihi beban 20 kg per rak.', '10–14 hari kerja', null, null),
  ('Dipan Jati Queen 160 x 200', 'Dipan', 6750000, 4, 'Dipan queen dengan kepala ranjang ukir polos dan kaki tinggi. Muat kasur 160 x 200 cm.', '/produk/dipan.svg',
   'Kayu jati kelas I, sambungan pen dan baut', 'Melamine doff, 3 lapis', 'Natural jati', 215, 175, 100, 70.0, 'indoor', 'Garansi 2 tahun untuk struktur', 'Lap kering atau lembap. Kencangkan baut tiap 6 bulan.', '21–30 hari kerja', null, 'Baru'),
  ('Bangku Panjang Teras Jati', 'Kursi', 1250000, 6, 'Bangku panjang untuk 2–3 orang dengan sandaran papan jati, kokoh di teras maupun taman.', '/produk/kursi.svg',
   'Kayu jati kelas I, baut stainless', 'Teak oil tahan cuaca, 2 lapis', 'Natural jati', 130, 50, 85, 16.0, 'outdoor', 'Garansi 1 tahun untuk sambungan dan struktur', 'Lap dengan kain lembap. Oles teak oil tiap 6 bulan.', '10–14 hari kerja', null, null),
  ('Ayunan Rotan Gantung', 'Kursi', 1980000, 6, 'Kursi gantung anyaman rotan asli bergaya bohemian, lengkap dengan rantai dan bantal dudukan.', '/produk/kursi.svg',
   'Rotan asli, rangka rotan lilit, rantai besi galvanis', 'Clear coat anti jamur', 'Natural rotan', 95, 70, 120, 8.0, 'indoor-outdoor', 'Garansi 6 bulan untuk anyaman dan rantai', 'Pakai di tempat teduh. Lap dengan kain lembap. Beban maks. 100 kg.', '14–21 hari kerja', null, null),
  ('Meja Konsol Mahoni', 'Meja', 2150000, 6, 'Meja konsol ramping dengan dua laci kecil, cocok untuk ruang tamu atau lorong masuk.', '/produk/meja.svg',
   'Kayu mahoni, rel laci besi', 'Clear doff, 2 lapis', 'Cokelat natural', 100, 35, 80, 15.0, 'indoor', 'Garansi 1 tahun untuk struktur dan laci', 'Lap kering. Hindari benda panas langsung di atas meja.', '10–14 hari kerja', null, null),
  ('Keranjang Rotan Serbaguna', 'Dekorasi', 285000, 20, 'Keranjang anyaman tangan untuk penyimpanan selimut, mainan, atau pakaian kotor. Dilengkapi tutup.', '/produk/dekorasi.svg',
   'Rotan asli, anyaman tangan', 'Clear coat anti jamur', 'Natural rotan', 40, 40, 55, 1.2, 'indoor', 'Garansi 3 bulan untuk anyaman', 'Lap kering. Jemur di tempat teduh bila lembap.', '5–7 hari kerja', null, null),
  ('Nampan Kayu Jati Ukir', 'Dekorasi', 195000, 15, 'Nampan saji dengan pegangan ukir dan alas rata, aman untuk makanan setelah dilapisi food-grade oil.', '/produk/dekorasi.svg',
   'Kayu jati, ukiran tangan', 'Food-grade mineral oil', 'Natural jati', 45, 30, 6, 1.0, 'indoor', 'Garansi 3 bulan untuk struktur', 'Cuci tangan dengan sabun lembut, keringkan. Oles minyak tiap 3 bulan.', '5–7 hari kerja', null, null)
),
perbarui as (
  update public.produk p set
    bahan = d.bahan, finishing = d.finishing, warna = d.warna,
    panjang_cm = d.p, lebar_cm = d.l, tinggi_cm = d.t, berat_kg = d.berat,
    penggunaan = d.penggunaan, garansi = d.garansi, perawatan = d.perawatan,
    waktu_pembuatan = d.waktu, harga_coret = d.coret, badge = d.badge
  from data d where p.nama = d.nama
  returning p.nama
)
insert into public.produk (nama, kategori, harga, stok, deskripsi, foto_url, bahan, finishing, warna, panjang_cm, lebar_cm, tinggi_cm, berat_kg, penggunaan, garansi, perawatan, waktu_pembuatan, harga_coret, badge)
select d.nama, d.kategori, d.harga, d.stok, d.deskripsi, d.foto_url, d.bahan, d.finishing, d.warna, d.p, d.l, d.t, d.berat, d.penggunaan, d.garansi, d.perawatan, d.waktu, d.coret, d.badge
from data d
where not exists (select 1 from public.produk x where x.nama = d.nama);

-- Tanda (+) contoh pada ruangan, diisi hanya jika tabel tanda masih kosong.
insert into public.tanda (ruangan_id, produk_id, x, y)
select r.id, p.id, t.x, t.y
from (values ('Ruang Tamu','Sofa Kulit Coklat Klasik',40,62), ('Ruang Tamu','Meja Konsol Mahoni',72,60), ('Teras','Kursi Halaman Depan',35,66), ('Teras','Meja Halaman Depan',62,64)) as t (ruang, produk, x, y)
join public.ruangan r on r.nama = t.ruang
join public.produk p on p.nama = t.produk
where not exists (select 1 from public.tanda);
