"use client";
import { useEffect, useRef, useState } from "react";
import { tanyaAsistenProduk } from "../app/aksi";
import { PERTANYAAN_CEPAT } from "../lib/asisten";

export default function AsistenProduk({ p, toko }) {
  const [pesan, setPesan] = useState([{ dari: "bot", teks: `Halo! Aku asisten untuk ${p.nama}. Mau tanya soal stok, bahan, ukuran, atau cara memesan? Silakan tanya di bawah.` }]);
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const log = useRef(null);

  const kirim = async (teks) => {
    const q = teks.trim().slice(0, 200);
    if (!q || loading) return;
    setError(null);
    setPesan((m) => [...m, { dari: "saya", teks: q }]);
    setIsi("");
    setLoading(true);
    try {
      const res = await tanyaAsistenProduk(p.id, q);
      if (res?.error) setError(res.error);
      else setPesan((m) => [...m, { dari: "bot", tanya: q, teks: res.jawaban, wa: res.wa }]);
    } catch { setError("Asisten belum bisa menjawab. Coba lagi nanti."); }
    setLoading(false);
  };
  useEffect(() => { if (pesan.length > 1 || loading) log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" }); }, [pesan, loading]);
  const linkWA = (q) => `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(`Halo ${toko.nama}, saya mau tanya soal ${p.nama}: ${q}`)}`;

  return (
    <section className="panel mt-14 p-5 md:p-7" aria-labelledby="judul-asisten">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-brand text-lg" aria-hidden="true">🤖</span>
        <div>
          <h2 id="judul-asisten" className="font-display text-lg font-bold md:text-xl">Tanya Asisten seputar {p.nama}</h2>
          <p className="text-xs text-redam">Jawaban instan otomatis berdasarkan data produk dan info toko.</p>
        </div>
      </div>
      <div ref={log} role="log" aria-live="polite" className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto rounded-xl border border-garis bg-kertas p-4">
        {pesan.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.dari === "saya" ? "self-end bg-brand text-white" : "self-start border border-garis bg-white"}`}>
            {m.teks}
            {m.wa && <a href={linkWA(m.tanya || "")} target="_blank" rel="noopener noreferrer" className="btn-brand mt-2 block px-3 py-1.5 text-xs">Tanya via WhatsApp</a>}
          </div>
        ))}
        {loading && <p className="animate-pulse text-xs text-redam">🤖 Asisten sedang mengetik jawaban…</p>}
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{error}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {PERTANYAAN_CEPAT.map((q) => <button key={q} type="button" disabled={loading} onClick={() => kirim(q)} className="btn-garis px-3 py-1.5 text-xs font-medium disabled:opacity-50">💬 {q}</button>)}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); kirim(isi); }} className="mt-3 flex gap-2">
        <input value={isi} onChange={(e) => setIsi(e.target.value)} maxLength={200} placeholder="Ketik pertanyaanmu seputar produk ini…" aria-label="Pertanyaan untuk asisten" className="input" />
        <button type="submit" disabled={loading || !isi.trim()} className="btn-brand disabled:opacity-50">Kirim</button>
      </form>
    </section>
  );
}
