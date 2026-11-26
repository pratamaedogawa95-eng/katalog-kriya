"use client";
import { useActionState } from "react";
import { kirimUlasan } from "../app/aksi";

export default function FormUlasan({ produkId }) {
  const [s, aksi, tunda] = useActionState(kirimUlasan, null);
  return (
    <form action={aksi} className="panel mt-4 flex flex-col gap-3 p-5">
      <h3 className="font-display text-lg font-bold">Tulis ulasan</h3>
      <input type="hidden" name="produk_id" value={produkId} />
      {/* kolom jebakan untuk bot: disembunyikan dari pengguna */}
      <div className="absolute -left-[9999px]" aria-hidden="true"><label>Situs<input name="situs" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
        <div><label htmlFor="ul-nama" className="label">Nama</label><input id="ul-nama" name="nama" required maxLength={40} className="input" /></div>
        <div><label htmlFor="ul-rating" className="label">Rating</label>
          <select id="ul-rating" name="rating" defaultValue="5" className="input">{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}</select></div>
      </div>
      <div><label htmlFor="ul-isi" className="label">Ulasan</label><textarea id="ul-isi" name="isi" required minLength={10} maxLength={600} rows={3} className="input" placeholder="Ceritakan kualitas, ukuran, atau pengirimannya." /></div>
      {s && <p role="status" className={`rounded-lg px-3.5 py-2.5 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>{s.error || s.ok}</p>}
      <button className="btn-brand w-fit" disabled={tunda}>{tunda ? "Mengirim…" : "Kirim ulasan"}</button>
    </form>
  );
}
