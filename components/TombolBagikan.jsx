"use client";
import { useState } from "react";

export default function TombolBagikan({ judul }) {
  const [pesan, setPesan] = useState("");
  async function bagikan() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: judul, url }); return; }
      await navigator.clipboard.writeText(url);
      setPesan("Link disalin.");
    } catch (e) {
      if (e?.name !== "AbortError") setPesan("Salin link dari bilah alamat.");
    }
    setTimeout(() => setPesan(""), 2500);
  }
  return (
    <span className="inline-flex items-center gap-2">
      <button type="button" onClick={bagikan} className="btn-garis px-4 py-3.5">🔗 Bagikan</button>
      <span role="status" className="text-sm text-redam">{pesan}</span>
    </span>
  );
}
