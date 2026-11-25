"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Foto from "./Foto";
import { rupiah } from "../lib/format";

export default function TerakhirDilihat({ produk }) {
  const [ids, setIds] = useState([]);
  useEffect(() => { try { setIds(JSON.parse(localStorage.getItem("dilihat") || "[]")); } catch {} }, []);
  const daftar = ids.map((id) => produk.find((p) => p.id === id)).filter(Boolean);
  if (!daftar.length) return null;
  return (
    <div className="mt-12">
      <h3 className="font-display text-xl font-bold">Terakhir dilihat</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {daftar.map((p) => (
          <Link key={p.id} href={`/produk/${p.id}`} className="panel overflow-hidden hover:shadow-lg">
            <Foto src={p.foto_url} alt={p.nama} className="aspect-square w-full" />
            <div className="p-3"><p className="truncate text-sm font-semibold">{p.nama}</p><p className="text-sm font-bold text-brand">{rupiah(p.harga)}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
