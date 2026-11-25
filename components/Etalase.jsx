"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Foto from "./Foto";
import { rupiah } from "../lib/format";
import { toko, linkWA } from "../lib/toko";

export default function Etalase({ produk, ruangan }) {
  const [jenis, setJenis] = useState("indoor");
  const [ruId, setRuId] = useState(null);
  const [tId, setTId] = useState(null);
  const [latar, setLatar] = useState(null);
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState("");
  const [stokF, setStokF] = useState("semua");
  const kanvas = useRef(null);
  const seret = useRef(null);

  const daftar = ruangan.filter((r) => r.jenis === jenis);
  const ru = daftar.find((r) => r.id === ruId) || daftar[0];
  const tanda = ru?.tanda?.find((t) => t.id === tId);
  const pAktif = tanda && produk.find((p) => p.id === tanda.produk_id);
  const terpilih = items.find((i) => i.uid === sel);
  const ada = (p) => (p.stok ?? 1) > 0;

  const pasang = (id) => {
    const uid = `${Date.now()}${Math.random()}`;
    setItems((l) => [...l, { uid, id, x: 50, y: 58, w: 24 }]);
    setSel(uid);
  };
  const unggah = (e) => { const f = e.target.files?.[0]; if (f) setLatar(URL.createObjectURL(f)); };
  const turun = (e, uid) => { e.currentTarget.setPointerCapture(e.pointerId); seret.current = uid; setSel(uid); };
  const geser = (e) => {
    if (!seret.current) return;
    const r = kanvas.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setItems((l) => l.map((i) => (i.uid === seret.current ? { ...i, x, y } : i)));
  };
  const picker = produk.filter((p) => `${p.nama} ${p.kategori || ""}`.toLowerCase().includes(q.toLowerCase()) && (stokF === "semua" || (stokF === "ada") === ada(p)));

  return (
    <>
      <section id="display" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-14">
        <h2 className="font-display text-3xl font-bold">Ruang display</h2>
        <p className="mt-2 max-w-xl text-redam">Klik tanda <b>+</b> pada furnitur untuk melihat detail, harga, dan memesannya.</p>
        <div className="mt-5 flex gap-2">
          {[["indoor", "Indoor"], ["outdoor", "Outdoor"]].map(([k, n]) => (
            <button key={k} onClick={() => { setJenis(k); setRuId(null); setTId(null); }} aria-pressed={jenis === k} className={jenis === k ? "btn-brand" : "btn-garis"}>{n}</button>
          ))}
          {daftar.length > 1 && (
            <select value={ru?.id} onChange={(e) => { setRuId(Number(e.target.value)); setTId(null); }} aria-label="Pilih ruangan" className="input w-48">
              {daftar.map((r) => <option key={r.id} value={r.id}>{r.nama}</option>)}
            </select>
          )}
        </div>
        {!ru ? <p className="panel mt-5 p-10 text-center text-redam">Ruangan tidak ditemukan.</p> : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_20rem]">
            <div className="relative aspect-[8/5] overflow-hidden rounded-2xl border border-garis bg-stone-200">
              <Foto src={ru.foto_url} alt={ru.nama} className="size-full" />
              {ru.tanda?.map((t) => (
                <button key={t.id} onClick={() => setTId(t.id)} aria-label="Lihat detail produk" style={{ left: `${t.x}%`, top: `${t.y}%` }}
                  className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-2 border-white text-lg font-bold shadow-lg ${t.id === tId ? "bg-teak text-kuningan" : "bg-brand text-white hover:scale-110"}`}>+</button>
              ))}
            </div>
            <div className="panel p-5">
              {pAktif ? (
                <div className="flex flex-col gap-3">
                  <Foto src={pAktif.foto_url} alt={pAktif.nama} className="aspect-[4/3] w-full rounded-lg" />
                  <h3 className="font-display text-xl font-bold">{pAktif.nama}</h3>
                  <p className="font-display text-xl font-bold text-brand">{rupiah(pAktif.harga)}</p>
                  <p className="text-sm text-redam">{ada(pAktif) ? `Stok tersedia: ${pAktif.stok ?? "–"}` : "Stok habis"}</p>
                  <a href={linkWA(`Halo ${toko.nama}, saya mau pesan ${pAktif.nama} (${rupiah(pAktif.harga)}).`)} target="_blank" rel="noopener noreferrer" className="btn-brand">Pesan via WhatsApp</a>
                  <div className="flex gap-2">
                    <a href="#simulasi" onClick={() => pasang(pAktif.id)} className="btn-garis flex-1">Coba di simulasi</a>
                    <Link href={`/produk/${pAktif.id}`} className="btn-garis flex-1">Detail</Link>
                  </div>
                </div>
              ) : <p className="py-10 text-center text-sm text-redam">Pilih tanda <b>+</b> di foto untuk melihat produknya.</p>}
            </div>
          </div>
        )}
      </section>

      <section id="simulasi" className="mx-auto max-w-6xl scroll-mt-20 px-5 pt-16">
        <h2 className="font-display text-3xl font-bold">Simulasi ruangan</h2>
        <p className="mt-2 max-w-xl text-redam">Unggah foto ruanganmu, pasang produk, lalu geser sesuka hati. Foto tidak diunggah ke server.</p>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_20rem]">
          <div>
            <div ref={kanvas} className="relative aspect-[8/5] touch-none overflow-hidden rounded-2xl border border-garis bg-stone-100" onClick={() => setSel(null)}>
              {latar ? <img src={latar} alt="Foto ruangan" className="size-full object-cover" /> : (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-semibold">Unggah foto ruanganmu</p>
                    <label className="btn-brand">Pilih foto<input type="file" accept="image/*" onChange={unggah} className="sr-only" /></label>
                    {ru && <button onClick={() => setLatar(ru.foto_url)} className="text-sm font-medium text-brand underline">atau pakai ruangan contoh</button>}
                  </div>
                </div>
              )}
              {items.map((i) => {
                const p = produk.find((x) => x.id === i.id);
                return p && (
                  <img key={i.uid} src={p.foto_url} alt={p.nama} draggable={false} onPointerDown={(e) => { e.stopPropagation(); turun(e, i.uid); }} onPointerMove={geser} onPointerUp={() => (seret.current = null)}
                    style={{ left: `${i.x}%`, top: `${i.y}%`, width: `${i.w}%` }}
                    className={`absolute aspect-square -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none rounded-lg object-cover shadow-xl ${i.uid === sel ? "outline-2 outline-offset-2 outline-kuningan outline-dashed" : ""}`} />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {terpilih && <label className="flex items-center gap-2 text-sm font-medium">Ukuran<input type="range" min="8" max="60" value={terpilih.w} onChange={(e) => setItems((l) => l.map((i) => (i.uid === sel ? { ...i, w: Number(e.target.value) } : i)))} /></label>}
              {terpilih && <button onClick={() => { setItems((l) => l.filter((i) => i.uid !== sel)); setSel(null); }} className="btn-bahaya px-3 py-1.5">Hapus item</button>}
              <button onClick={() => { setItems([]); setSel(null); }} className="btn-garis px-3 py-1.5">Bersihkan item</button>
              <button onClick={() => { setItems([]); setSel(null); setLatar(null); }} className="btn-garis px-3 py-1.5">Kosongkan ruangan</button>
            </div>
          </div>
          <div className="panel flex max-h-[28rem] flex-col p-4">
            <h3 className="font-display text-lg font-bold">Cari &amp; pasang produk</h3>
            <div className="mt-3 flex gap-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari produk" aria-label="Cari produk simulasi" className="input" />
              <select value={stokF} onChange={(e) => setStokF(e.target.value)} aria-label="Stok" className="input w-28"><option value="semua">Semua</option><option value="ada">Tersedia</option><option value="habis">Habis</option></select>
            </div>
            <ul className="mt-3 flex-1 divide-y divide-garis overflow-y-auto">
              {picker.length === 0 && <li className="py-6 text-center text-sm text-redam">Tidak ada produk yang cocok.</li>}
              {picker.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <Foto src={p.foto_url} alt="" className="size-11 rounded-md" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.nama}</p><p className="text-xs text-redam">{rupiah(p.harga)}</p></div>
                  <button onClick={() => pasang(p.id)} className="btn-garis px-3 py-1.5">+ Pasang</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
