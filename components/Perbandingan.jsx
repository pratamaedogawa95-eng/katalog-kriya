"use client";
import { useState } from "react";
import Foto from "./Foto";
import { rupiah } from "../lib/format";
import { dimensi, labelPenggunaan } from "../lib/produk";

// US-37: bandingkan 2 produk berdampingan. Baris dengan data kosong di kedua produk disembunyikan.
const BARIS = [
  ["Kategori", (p) => p.kategori],
  ["Harga", (p) => rupiah(p.harga)],
  ["Penggunaan", (p) => labelPenggunaan(p.penggunaan)],
  ["Bahan", (p) => p.bahan],
  ["Finishing", (p) => p.finishing],
  ["Warna", (p) => p.warna],
  ["Dimensi (P × L × T)", (p) => dimensi(p)],
  ["Berat", (p) => (p.berat_kg ? `${String(p.berat_kg).replace(".", ",")} kg` : null)],
  ["Waktu pembuatan", (p) => p.waktu_pembuatan],
  ["Garansi", (p) => p.garansi],
  ["Stok", (p) => ((p.stok ?? 1) > 0 ? `Tersedia (${p.stok ?? "–"})` : "Habis")],
];

export default function Perbandingan({ daftar, onHapus, onKosongkan }) {
  const [buka, setBuka] = useState(false);
  if (daftar.length === 0) return null;
  const baris = BARIS.filter(([, f]) => daftar.some((p) => f(p)));
  return (
    <>
      {!buka && (
        <div className="fixed bottom-5 left-5 z-40 flex items-center gap-3 rounded-full border border-garis bg-white py-2 pl-5 pr-2 shadow-xl">
          <span className="text-sm font-medium">Bandingkan ({daftar.length}/2)</span>
          <button onClick={() => setBuka(true)} disabled={daftar.length < 2} className="btn-brand px-4 py-1.5 disabled:opacity-50">Lihat</button>
          <button onClick={onKosongkan} className="btn-garis px-3 py-1.5" aria-label="Kosongkan perbandingan">✕</button>
        </div>
      )}
      {buka && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4" onClick={() => setBuka(false)}>
          <div role="dialog" aria-label="Perbandingan produk" onClick={(e) => e.stopPropagation()} className="panel w-full max-w-3xl p-5">
            <div className="flex items-center justify-between"><h3 className="font-display text-xl font-bold">Bandingkan produk</h3><button onClick={() => setBuka(false)} className="btn-garis px-3 py-1.5">Tutup</button></div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead><tr><th className="w-36" />{daftar.map((p) => (
                  <th key={p.id} className="p-2 align-top"><Foto src={p.foto_url} alt={p.nama} className="aspect-[4/3] w-full rounded-lg" /><p className="mt-2 font-semibold">{p.nama}</p>
                    <button onClick={() => { onHapus(p.id); setBuka(false); }} className="text-xs font-normal text-redam underline">Ganti</button></th>))}</tr></thead>
                <tbody>{baris.map(([k, f]) => (
                  <tr key={k} className="border-t border-garis"><td className="p-2 text-redam">{k}</td>{daftar.map((p) => <td key={p.id} className="p-2 font-medium">{f(p) || "–"}</td>)}</tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
