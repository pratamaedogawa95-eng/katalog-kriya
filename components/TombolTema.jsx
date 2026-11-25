"use client";
import { useEffect, useState } from "react";

// Mode gelap/terang (US-25). Pilihan disimpan di localStorage; tanpa pilihan, mengikuti pengaturan perangkat.
export default function TombolTema() {
  const [gelap, setGelap] = useState(false);
  useEffect(() => { setGelap(document.documentElement.classList.contains("dark")); }, []);
  function ganti() {
    const baru = !gelap;
    setGelap(baru);
    document.documentElement.classList.toggle("dark", baru);
    try { localStorage.setItem("tema", baru ? "gelap" : "terang"); } catch {}
  }
  return (
    <button type="button" onClick={ganti} aria-pressed={gelap} aria-label={gelap ? "Pakai mode terang" : "Pakai mode gelap"} className="grid size-9 cursor-pointer place-items-center rounded-lg border border-garis text-base hover:bg-stone-100">
      <span aria-hidden="true">{gelap ? "☀️" : "🌙"}</span>
    </button>
  );
}
