"use client";
import { useState } from "react";
import TombolWhatsApp from "./TombolWhatsApp";
import TombolBagikan from "./TombolBagikan";
import { rupiah } from "../lib/format";

// Pilih jumlah sebelum memesan (US-12). Dibatasi sesuai stok.
export default function PesanProduk({ produk }) {
  const maks = Math.min(99, produk.stok ?? 99);
  const varian = Array.isArray(produk.varian) ? produk.varian : [];
  const [pilih, setPilih] = useState(0);
  const [jml, setJml] = useState(1);
  const v = varian[pilih];
  const item = v ? { ...produk, harga: v.harga, nama: `${produk.nama} (${v.nama})` } : produk;
  const ubah = (d) => setJml((j) => Math.min(maks, Math.max(1, j + d)));
  return (
    <div className="flex flex-col gap-4">
      {varian.length > 0 && (
        <fieldset><legend className="mb-2 text-sm font-medium">Pilih ukuran</legend>
          <div className="flex flex-wrap gap-2">{varian.map((x, i) => (
            <button key={x.nama} type="button" onClick={() => setPilih(i)} aria-pressed={i === pilih} className={i === pilih ? "btn-brand px-3 py-1.5" : "btn-garis px-3 py-1.5"}>{x.nama} · {rupiah(x.harga)}</button>))}</div>
        </fieldset>
      )}
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center overflow-hidden rounded-lg border border-garis">
          <button type="button" onClick={() => ubah(-1)} disabled={jml <= 1} aria-label="Kurangi jumlah" className="size-10 text-lg font-bold hover:bg-stone-100 disabled:opacity-40">−</button>
          <span className="w-10 text-center font-semibold" aria-live="polite">{jml}</span>
          <button type="button" onClick={() => ubah(1)} disabled={jml >= maks} aria-label="Tambah jumlah" className="size-10 text-lg font-bold hover:bg-stone-100 disabled:opacity-40">+</button>
        </div>
        <p className="text-sm text-redam">Total <b className="font-display text-lg text-tinta">{rupiah(item.harga * jml)}</b></p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TombolWhatsApp produk={item} jumlah={jml} />
        <TombolBagikan judul={produk.nama} />
      </div>
    </div>
  );
}
