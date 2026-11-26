# Katalog Kala & Karsa

Next.js 16 + Tailwind 4 + Supabase. Ikuti urutan di worksheet (Langkah 1–7 untuk Vercel/Supabase/.env.local), lalu `npm install` dan `npm run dev`.
Ubah nama toko dan nomor WhatsApp di `lib/toko.js`. Jalankan `docs/schema.sql` di Supabase SQL Editor (Langkah 3).

## Tentang aplikasi ini
Katalog furnitur & prabotan handmade (indoor dan outdoor) dengan ruang display bertanda (+), simulasi di foto ruangan, pencarian, filter stok, favorit, keranjang WhatsApp, dan admin (produk, stok, ruangan, ganti password). Jalankan `docs/schema.sql` lalu `docs/schema-tambahan.sql`.
Semua akses Supabase dari server; tidak ada variabel `NEXT_PUBLIC_`.


## Data furnitur (spesifikasi standar)
Setiap produk punya: bahan, finishing, warna, dimensi (P × L × T cm), berat, penggunaan (indoor/outdoor), garansi, perawatan, waktu pembuatan, harga coret, dan badge.
Urutan SQL di Supabase: `docs/schema.sql` → `docs/schema-tambahan.sql` → `docs/migrasi-furnitur.sql`.
`migrasi-furnitur.sql` aman dijalankan ulang dan juga aman untuk database yang sudah berisi produkmu: produk dengan nama sama hanya diperbarui spesifikasinya; harga, foto, stok, dan deskripsi tidak berubah. **Angka bahan, dimensi, dan berat di file itu hanya contoh; sesuaikan lewat /admin.**

## Fitur tambahan
Halaman per kategori `/kategori/[slug]`, mode gelap, pilih jumlah di halaman detail, harga coret + badge, pencarian dan paginasi di daftar admin, validasi server (panjang teks, rentang angka, link foto).

## Fitur tahap 3
Foto tambahan (galeri), bandingkan 2 produk, kelola kategori, impor CSV, pengaturan toko dari admin (nama, WhatsApp, promo), log aktivitas admin, dan rate limit login di database.
Jalankan `docs/migrasi-bonus.sql` lalu `docs/migrasi-bonus2.sql` di Supabase SQL Editor **sebelum** deploy kode ini.
