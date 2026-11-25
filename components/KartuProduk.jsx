"use client";
import Link from "next/link";
import Foto from "./Foto";
import { rupiah } from "../lib/format";

export default function KartuProduk({ p, favorit, onFavorit, onTambah }) {
  return (
    <article className="group panel overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative">
        <Link href={`/produk/${p.id}`} aria-label={`Lihat ${p.nama}`}>
          <Foto src={p.foto_url} alt={p.nama} className="aspect-square w-full transition-transform duration-500 group-hover:scale-105" />
        </Link>
        <button onClick={() => onFavorit(p.id)} aria-pressed={favorit} aria-label={favorit ? "Hapus dari favorit" : "Simpan ke favorit"}
          className="absolute right-3 top-3 grid size-9 cursor-pointer place-items-center rounded-full bg-white/90 text-lg shadow">
          <span className={favorit ? "text-red-600" : "text-stone-400"}>{favorit ? "♥" : "♡"}</span>
        </button>
        {p.kategori && <span className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold">{p.kategori}</span>}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <Link href={`/produk/${p.id}`} className="font-semibold leading-snug hover:text-brand">{p.nama}</Link>
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-brand">{rupiah(p.harga)}</span>
          <button onClick={() => onTambah(p.id)} disabled={(p.stok ?? 1) <= 0} className="btn-garis px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">{(p.stok ?? 1) <= 0 ? "Habis" : "+ Keranjang"}</button>
        </div>
      </div>
    </article>
  );
}
