"use client";
import TombolDeskripsi from "./TombolDeskripsi";
import { useActionState } from "react";
import UnggahFoto from "./UnggahFoto";
import { masuk, gantiPassword, simpanProduk, simpanPengaturan, imporProduk, tambahAdmin } from "../app/admin/actions";

function Pesan({ s }) {
  if (!s) return null;
  return <p role="alert" className={`rounded-lg px-3.5 py-2.5 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{s.error || s.ok}</p>;
}
const Isian = ({ label, nama, ...r }) => (
  <div><label htmlFor={nama} className="label">{label}</label><input id={nama} name={nama} className="input" {...r} /></div>
);

export function FormLogin() {
  const [s, aksi, tunda] = useActionState(masuk, null);
  return (
    <form action={aksi} className="panel flex w-full max-w-sm flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">Masuk admin</h1>
      <Isian label="Email" nama="email" type="email" required autoComplete="email" />
      <Isian label="Password" nama="password" type="password" required autoComplete="current-password" />
      <Pesan s={s} />
      <button className="btn-brand" disabled={tunda}>{tunda ? "Memproses…" : "Masuk"}</button>
    </form>
  );
}

export function FormPassword() {
  const [s, aksi, tunda] = useActionState(gantiPassword, null);
  return (
    <form action={aksi} className="panel flex w-full max-w-sm flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">Ganti password</h1>
      <Isian label="Password baru" nama="baru" type="password" required minLength={8} autoComplete="new-password" />
      <Isian label="Ulangi password baru" nama="ulang" type="password" required autoComplete="new-password" />
      <Pesan s={s} />
      <button className="btn-brand" disabled={tunda}>{tunda ? "Menyimpan…" : "Simpan password"}</button>
    </form>
  );
}

export function FormProduk({ awal, kategoriAda = [] }) {
  const [s, aksi, tunda] = useActionState(simpanProduk, null);
  const v = (k) => awal?.[k] ?? "";
  return (
    <form action={aksi} className="panel flex w-full max-w-2xl flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">{awal ? "Ubah produk" : "Tambah produk"}</h1>
      {awal && <input type="hidden" name="id" value={awal.id} />}

      <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-display text-lg font-bold">Informasi dasar</legend>
        <Isian label="Nama produk" nama="nama" required maxLength={120} defaultValue={v("nama")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Isian label="Kategori (mis. Kursi, Meja, Lemari & Rak)" nama="kategori" maxLength={60} defaultValue={v("kategori")} list="daftar-kategori" />
          <datalist id="daftar-kategori">{kategoriAda.map((k) => <option key={k} value={k} />)}</datalist>
          <div><label htmlFor="penggunaan" className="label">Penggunaan</label>
            <select id="penggunaan" name="penggunaan" className="input" defaultValue={v("penggunaan")}>
              <option value="">Belum diisi</option><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option><option value="indoor-outdoor">Indoor &amp; outdoor</option>
            </select></div>
        </div>
        <div><div className="mb-1.5 flex items-center justify-between gap-2"><label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label><TombolDeskripsi /></div><textarea id="deskripsi" name="deskripsi" rows={4} maxLength={2000} className="input" defaultValue={v("deskripsi")} /></div>
        <div><label htmlFor="foto_tambahan" className="label">Foto tambahan (satu link per baris, maksimal 5)</label><textarea id="foto_tambahan" name="foto_tambahan" rows={3} className="input" defaultValue={(awal?.foto_tambahan || []).join("\n")} placeholder="https://…" /><div className="mt-2"><UnggahFoto target="foto_tambahan" tambah /></div></div>
        <div><Isian label="Link foto utama" nama="foto_url" defaultValue={v("foto_url")} placeholder="https://… atau /produk/kursi.svg" /><div className="mt-2"><UnggahFoto target="foto_url" /></div></div>
      </fieldset>

      <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-display text-lg font-bold">Harga &amp; stok</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Isian label="Harga jual (Rp)" nama="harga" type="number" min="0" step="1" required defaultValue={v("harga")} />
          <Isian label="Harga coret (Rp, opsional)" nama="harga_coret" type="number" min="0" step="1" defaultValue={v("harga_coret")} />
          <Isian label="Stok" nama="stok" type="number" min="0" step="1" required defaultValue={awal?.stok ?? 10} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Isian label="Urutan tampil (0 = biasa, angka kecil lebih dulu)" nama="urutan" type="number" min="0" max="9999" step="1" defaultValue={awal?.urutan ?? 0} />
          <label className="mt-7 flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="aktif" defaultChecked={awal?.aktif ?? true} className="size-4" /> Tampilkan di toko (aktif)</label>
        </div>
        <div><label htmlFor="varian" className="label">Varian harga per ukuran (opsional, satu per baris: Nama | Harga)</label><textarea id="varian" name="varian" rows={3} className="input" defaultValue={(awal?.varian || []).map((x) => `${x.nama} | ${x.harga}`).join("\n")} placeholder={"120 cm | 1650000\n160 cm | 2100000"} /><p className="mt-1 text-xs text-redam">Bila diisi, pelanggan memilih varian di halaman produk. Isi kolom Harga jual dengan varian termurah.</p></div>
        <Isian label="Badge (opsional, mis. Baru, Terlaris, Hemat)" nama="badge" maxLength={20} defaultValue={v("badge")} />
      </fieldset>

      <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-display text-lg font-bold">Spesifikasi</legend>
        <Isian label="Bahan (jenis kayu, rotan, besi, busa, kain)" nama="bahan" maxLength={200} defaultValue={v("bahan")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Isian label="Finishing" nama="finishing" maxLength={200} defaultValue={v("finishing")} placeholder="mis. Melamine doff, teak oil" />
          <Isian label="Warna" nama="warna" maxLength={80} defaultValue={v("warna")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <Isian label="Panjang (cm)" nama="panjang_cm" type="number" min="1" step="1" defaultValue={v("panjang_cm")} />
          <Isian label="Lebar (cm)" nama="lebar_cm" type="number" min="1" step="1" defaultValue={v("lebar_cm")} />
          <Isian label="Tinggi (cm)" nama="tinggi_cm" type="number" min="1" step="1" defaultValue={v("tinggi_cm")} />
          <Isian label="Berat (kg)" nama="berat_kg" type="number" min="0.1" step="0.1" defaultValue={v("berat_kg")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Isian label="Waktu pembuatan" nama="waktu_pembuatan" maxLength={80} defaultValue={v("waktu_pembuatan")} placeholder="mis. 10–14 hari kerja" />
          <Isian label="Garansi" nama="garansi" maxLength={200} defaultValue={v("garansi")} placeholder="mis. Garansi 1 tahun untuk struktur" />
        </div>
        <div><label htmlFor="perawatan" className="label">Perawatan</label><textarea id="perawatan" name="perawatan" rows={3} maxLength={500} className="input" defaultValue={v("perawatan")} /></div>
      </fieldset>

      <Pesan s={s} />
      <div className="flex gap-3"><button className="btn-brand" disabled={tunda}>{tunda ? "Menyimpan…" : "Simpan produk"}</button><a href="/admin" className="btn-garis">Batal</a></div>
    </form>
  );
}

export function TombolHapus({ aksi, id, nama }) {
  return (
    <form action={aksi} onSubmit={(e) => { if (!confirm(`Hapus "${nama}"?`)) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button className="btn-bahaya px-3 py-1.5">Hapus</button>
    </form>
  );
}

export function FormPengaturan({ awal }) {
  const [s, aksi, tunda] = useActionState(simpanPengaturan, null);
  const v = (k) => awal?.[k] ?? "";
  return (
    <form action={aksi} className="panel flex w-full max-w-2xl flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">Pengaturan toko</h1>
      <Isian label="Nama toko" nama="nama" maxLength={80} defaultValue={v("nama")} />
      <Isian label="Tagline (judul besar di beranda)" nama="tagline" maxLength={160} defaultValue={v("tagline")} />
      <div><label htmlFor="deskripsi" className="label">Deskripsi singkat</label><textarea id="deskripsi" name="deskripsi" rows={3} maxLength={500} className="input" defaultValue={v("deskripsi")} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Isian label="Alamat" nama="alamat" maxLength={200} defaultValue={v("alamat")} />
        <Isian label="Jam buka" nama="jam_buka" maxLength={80} defaultValue={v("jam_buka")} />
      </div>
      <Isian label="Nomor WhatsApp (mis. 6281234567890)" nama="nomor_whatsapp" inputMode="numeric" required defaultValue={v("nomor_whatsapp")} />
      <fieldset className="flex flex-col gap-4"><legend className="mb-1 font-display text-lg font-bold">Banner promo (kosongkan teks untuk menyembunyikan)</legend>
        <Isian label="Teks promo" nama="promo_teks" maxLength={160} defaultValue={v("promo_teks")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Isian label="Label tautan" nama="promo_label" maxLength={30} defaultValue={v("promo_label")} />
          <Isian label="Tautan (#katalog, /kategori/kursi, atau https://…)" nama="promo_tautan" maxLength={200} defaultValue={v("promo_tautan")} />
        </div>
      </fieldset>
      <Pesan s={s} />
      <button className="btn-brand w-fit" disabled={tunda}>{tunda ? "Menyimpan…" : "Simpan pengaturan"}</button>
    </form>
  );
}

export function FormImpor() {
  const [s, aksi, tunda] = useActionState(imporProduk, null);
  return (
    <form action={aksi} className="panel flex w-full max-w-xl flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">Impor produk dari CSV</h1>
      <p className="text-sm text-redam">Kolom wajib: <b>nama</b> dan <b>harga</b>. Kolom lain opsional (kategori, penggunaan, stok, bahan, dimensi, dll.). Paling mudah: <a href="/admin/ekspor" className="font-medium text-brand underline">Ekspor CSV</a>, ubah di Excel, lalu impor. Maksimal 200 baris dan 200 KB. Impor menambah produk baru, tidak menimpa yang sudah ada.</p>
      <div><label htmlFor="berkas" className="label">Berkas CSV</label><input id="berkas" name="berkas" type="file" accept=".csv,text/csv" required className="input" /></div>
      <Pesan s={s} />
      <button className="btn-brand w-fit" disabled={tunda}>{tunda ? "Mengimpor…" : "Impor"}</button>
    </form>
  );
}

export function FormAkun() {
  const [s, aksi, tunda] = useActionState(tambahAdmin, null);
  return (
    <form action={aksi} className="panel mt-6 flex w-full max-w-md flex-col gap-4 p-6">
      <h2 className="font-display text-lg font-bold">Tambah admin</h2>
      <Isian label="Email" nama="email" type="email" required autoComplete="off" />
      <Isian label="Password awal (minimal 10 karakter)" nama="password" type="password" required minLength={10} autoComplete="new-password" />
      <Pesan s={s} />
      <button className="btn-brand w-fit" disabled={tunda}>{tunda ? "Membuat…" : "Buat akun"}</button>
    </form>
  );
}
