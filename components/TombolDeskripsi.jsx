"use client";
import { useState } from "react";
import { generateDeskripsiAI } from "../app/admin/actions";

const KUNCI = ["nama", "kategori", "penggunaan", "bahan", "finishing", "warna", "panjang_cm", "lebar_cm", "tinggi_cm", "waktu_pembuatan", "garansi"];

export default function TombolDeskripsi() {
  const [loading, setLoading] = useState(false);
  const buat = async (e) => {
    const form = e.currentTarget.form;
    const fd = new FormData(form);
    const f = Object.fromEntries(KUNCI.map((k) => [k, String(fd.get(k) ?? "")]));
    if (!f.nama.trim()) return alert("Isi nama produk terlebih dahulu.");
    const area = form.elements.deskripsi;
    if (area.value.trim() && !confirm("Ganti deskripsi yang sudah ada?")) return;
    setLoading(true);
    try {
      const h = await generateDeskripsiAI(f);
      if (h?.success) { area.value = h.deskripsi; area.focus(); }
      else alert(h?.error || "Gagal membuat deskripsi.");
    } catch { alert("Gagal membuat deskripsi."); }
    setLoading(false);
  };
  return <button type="button" onClick={buat} disabled={loading} className="btn-garis px-3 py-1 text-xs disabled:opacity-50">{loading ? "Membuat…" : "✦ Buat deskripsi otomatis"}</button>;
}
