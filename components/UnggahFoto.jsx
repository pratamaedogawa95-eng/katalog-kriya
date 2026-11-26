"use client";
import { useState } from "react";
import { unggahFoto } from "../app/admin/actions";

// US-29: pilih gambar, diunggah ke Supabase Storage, lalu linknya diisikan ke kolom target (utama = ganti, tambahan = tambah baris).
export default function UnggahFoto({ target, tambah = false }) {
  const [info, setInfo] = useState("");
  const [tunda, setTunda] = useState(false);
  async function pilih(e) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { setInfo("Ukuran foto maksimal 4 MB."); return; }
    setTunda(true); setInfo("Mengunggah…");
    const fd = new FormData(); fd.append("berkas", f);
    let r; try { r = await unggahFoto(fd); } catch { r = { error: "Gagal mengunggah. Coba lagi." }; }
    setTunda(false);
    if (r?.error) { setInfo(r.error); return; }
    const el = document.getElementById(target);
    if (el) el.value = tambah ? `${el.value.trim() ? el.value.trim() + "\n" : ""}${r.url}` : r.url;
    setInfo("Terunggah. Klik “Simpan produk” untuk menyimpan.");
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className={`btn-garis cursor-pointer px-3 py-1.5 ${tunda ? "opacity-50" : ""}`}>Unggah foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={pilih} disabled={tunda} className="sr-only" /></label>
      <span role="status" className="text-redam">{info || "JPG, PNG, atau WebP, maksimal 4 MB."}</span>
    </div>
  );
}
