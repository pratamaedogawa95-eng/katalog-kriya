"use client";
import { useState } from "react";
import Foto from "./Foto";

// US-18: foto utama + foto tambahan dengan gambar kecil yang bisa diklik.
export default function GaleriProduk({ fotos, alt }) {
  const [i, setI] = useState(0);
  const daftar = fotos.filter(Boolean);
  return (
    <div>
      <Foto src={daftar[i]} alt={alt} className="aspect-square w-full rounded-2xl border border-garis" />
      {daftar.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {daftar.map((f, n) => (
            <button key={f + n} onClick={() => setI(n)} aria-label={`Foto ${n + 1}`} aria-pressed={n === i} className={`overflow-hidden rounded-lg border-2 ${n === i ? "border-brand" : "border-transparent"}`}>
              <Foto src={f} alt="" className="aspect-square w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
