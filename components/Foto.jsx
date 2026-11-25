"use client";
import { useState } from "react";

export default function Foto({ src, alt, className = "" }) {
  const [gagal, setGagal] = useState(false);
  if (!src || gagal) return <div className={`bg-gradient-to-br from-stone-200 to-stone-300 ${className}`} role="img" aria-label={alt} />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setGagal(true)} className={`object-cover ${className}`} />;
}
