"use client";
import { useActionState } from "react";
import { masuk, gantiPassword, simpanProduk } from "../app/admin/actions";

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

export function FormProduk({ awal }) {
  const [s, aksi, tunda] = useActionState(simpanProduk, null);
  return (
    <form action={aksi} className="panel flex w-full max-w-xl flex-col gap-4 p-7">
      <h1 className="font-display text-2xl font-bold">{awal ? "Ubah produk" : "Tambah produk"}</h1>
      {awal && <input type="hidden" name="id" value={awal.id} />}
      <Isian label="Nama produk" nama="nama" required defaultValue={awal?.nama} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Isian label="Harga (Rp)" nama="harga" type="number" min="0" step="1" required defaultValue={awal?.harga} />
        <Isian label="Kategori" nama="kategori" defaultValue={awal?.kategori || ""} />
      </div>
      <Isian label="Stok" nama="stok" type="number" min="0" step="1" required defaultValue={awal?.stok ?? 10} />
      <Isian label="Link foto" nama="foto_url" defaultValue={awal?.foto_url || ""} placeholder="https://…" />
      <div><label htmlFor="deskripsi" className="label">Deskripsi</label><textarea id="deskripsi" name="deskripsi" rows={4} className="input" defaultValue={awal?.deskripsi || ""} /></div>
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
