"use client";
import { useEffect, useMemo, useState } from "react";
import KartuProduk from "./KartuProduk";
import { rupiah } from "../lib/format";
import { toko, linkWA } from "../lib/toko";

export default function Katalog({ produk }) {
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("Semua");
  const [urut, setUrut] = useState("baru");
  const [stokF, setStokF] = useState("semua");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState([]);
  const [cart, setCart] = useState({});
  const [buka, setBuka] = useState(false);
  const [hal, setHal] = useState(1);
  const PER = 12; // produk per halaman
  useEffect(() => { setHal(1); }, [q, kat, urut, stokF, favOnly]);

  useEffect(() => { try { setFavs(JSON.parse(localStorage.getItem("favorit") || "[]")); } catch {} }, []);
  const ubahFav = (id) => setFavs((f) => {
    const n = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    try { localStorage.setItem("favorit", JSON.stringify(n)); } catch {}
    return n;
  });
  const ubahJumlah = (id, d = 1) => setCart((c) => {
    const j = (c[id] || 0) + d, n = { ...c };
    if (d > 0 && j > (produk.find((p) => p.id === id)?.stok ?? 99)) return c;
    if (j <= 0) delete n[id]; else n[id] = j;
    return n;
  });

  const kategori = useMemo(() => ["Semua", ...new Set(produk.map((p) => p.kategori).filter(Boolean))], [produk]);
  const tampil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    let l = produk.filter((p) => (kat === "Semua" || p.kategori === kat) && (stokF === "semua" || (stokF === "ada") === ((p.stok ?? 1) > 0)) && (!favOnly || favs.includes(p.id)) && `${p.nama} ${p.deskripsi || ""}`.toLowerCase().includes(kata));
    if (urut === "murah") l = [...l].sort((a, b) => a.harga - b.harga);
    if (urut === "mahal") l = [...l].sort((a, b) => b.harga - a.harga);
    if (urut === "nama") l = [...l].sort((a, b) => a.nama.localeCompare(b.nama));
    return l;
  }, [produk, q, kat, urut, stokF, favOnly, favs]);

  const jmlHal = Math.max(1, Math.ceil(tampil.length / PER));
  const halIni = Math.min(hal, jmlHal);
  const tampilHal = tampil.slice((halIni - 1) * PER, halIni * PER);
  const keHal = (n) => { setHal(n); document.getElementById("katalog")?.scrollIntoView({ behavior: "smooth" }); };

  const item = produk.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const jumlah = item.reduce((s, p) => s + p.qty, 0);
  const total = item.reduce((s, p) => s + p.qty * p.harga, 0);
  const pesan = `Halo ${toko.nama}, saya mau pesan:\n${item.map((p) => `- ${p.qty}x ${p.nama} (${rupiah(p.qty * p.harga)})`).join("\n")}\nTotal: ${rupiah(total)}`;

  return (
    <section id="katalog" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
      <h2 className="font-display text-3xl font-bold">Daftar produk</h2>
      <p className="mt-2 max-w-xl text-redam">Cari, saring, dan simpan favoritmu. Tambahkan beberapa produk ke keranjang lalu pesan sekaligus lewat WhatsApp.</p>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau deskripsi produk" aria-label="Cari produk" className="input md:flex-1" />
        <select value={urut} onChange={(e) => setUrut(e.target.value)} aria-label="Urutkan" className="input md:w-48">
          <option value="baru">Terbaru</option><option value="murah">Termurah</option><option value="mahal">Termahal</option><option value="nama">Nama A–Z</option>
        </select>
        <select value={stokF} onChange={(e) => setStokF(e.target.value)} aria-label="Stok" className="input md:w-40"><option value="semua">Semua stok</option><option value="ada">Tersedia</option><option value="habis">Habis</option></select>
        <button onClick={() => setFavOnly(!favOnly)} aria-pressed={favOnly} className={favOnly ? "btn-brand" : "btn-garis"}>♥ Favorit ({favs.length})</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {kategori.map((k) => (
          <button key={k} onClick={() => setKat(k)} aria-pressed={kat === k}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${kat === k ? "border-teak bg-teak text-white" : "border-garis bg-white hover:bg-stone-100"}`}>{k}</button>
        ))}
      </div>

      {tampil.length === 0 ? (
        <p className="panel mt-8 p-10 text-center text-redam">Produk tidak ditemukan. Ubah kata kunci atau pilih kategori lain.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {tampilHal.map((p) => <KartuProduk key={p.id} p={p} favorit={favs.includes(p.id)} onFavorit={ubahFav} onTambah={(id) => { ubahJumlah(id); }} />)}
        </div>
      )}

      {jmlHal > 1 && (
        <nav aria-label="Halaman produk" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => keHal(halIni - 1)} disabled={halIni === 1} className="btn-garis px-3 py-1.5 disabled:opacity-50">← Sebelumnya</button>
          {Array.from({ length: jmlHal }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => keHal(n)} aria-current={n === halIni ? "page" : undefined}
              className={n === halIni ? "btn-brand size-9 !p-0" : "btn-garis size-9 !p-0"}>{n}</button>
          ))}
          <button onClick={() => keHal(halIni + 1)} disabled={halIni === jmlHal} className="btn-garis px-3 py-1.5 disabled:opacity-50">Berikutnya →</button>
        </nav>
      )}
      <p className="mt-3 text-center text-sm text-redam">Menampilkan {tampilHal.length} dari {tampil.length} produk</p>

      {jumlah > 0 && !buka && (
        <button onClick={() => setBuka(true)} className="btn-brand fixed bottom-5 right-5 z-40 rounded-full px-5 py-3.5 shadow-xl">Keranjang ({jumlah}) · {rupiah(total)}</button>
      )}

      {buka && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setBuka(false)}>
          <aside onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl" aria-label="Keranjang">
            <div className="flex items-center justify-between border-b border-garis p-5">
              <h3 className="font-display text-xl font-bold">Keranjang</h3>
              <button onClick={() => setBuka(false)} className="btn-garis px-3 py-1.5" aria-label="Tutup keranjang">Tutup</button>
            </div>
            <ul className="flex-1 divide-y divide-garis overflow-y-auto px-5">
              {item.length === 0 && <li className="py-10 text-center text-redam">Keranjang masih kosong.</li>}
              {item.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0"><p className="truncate font-medium">{p.nama}</p><p className="text-sm text-redam">{rupiah(p.harga)}</p></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => ubahJumlah(p.id, -1)} className="btn-garis size-8 !p-0" aria-label="Kurangi">−</button>
                    <span className="w-5 text-center text-sm font-semibold">{p.qty}</span>
                    <button onClick={() => ubahJumlah(p.id, 1)} className="btn-garis size-8 !p-0" aria-label="Tambah">+</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-garis p-5">
              <div className="mb-4 flex justify-between font-semibold"><span>Total</span><span className="font-display text-lg text-brand">{rupiah(total)}</span></div>
              {item.length > 0 && <a href={linkWA(pesan)} target="_blank" rel="noopener noreferrer" className="btn-brand w-full py-3.5">Pesan semua via WhatsApp</a>}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
