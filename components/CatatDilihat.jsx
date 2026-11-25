"use client";
import { useEffect } from "react";

export default function CatatDilihat({ id }) {
  useEffect(() => {
    try {
      const lama = JSON.parse(localStorage.getItem("dilihat") || "[]");
      const baru = [id, ...lama.filter((x) => x !== id)].slice(0, 4);
      localStorage.setItem("dilihat", JSON.stringify(baru));
    } catch {}
  }, [id]);
  return null;
}
