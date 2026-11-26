import { headers } from "next/headers";
import { dbServer } from "./supabase/server";

// Pembatas laju. batasi() memakai database (fungsi cek_batas) sehingga tidak ter-reset di Vercel serverless;
// bila database/fungsi belum siap, otomatis memakai penghitung di memori (per instance).
const peta = new Map();

export function batasiLokal(kunci, maks, jendelaMs) {
  const kini = Date.now();
  const daftar = (peta.get(kunci) || []).filter((t) => kini - t < jendelaMs);
  if (daftar.length >= maks) { peta.set(kunci, daftar); return false; }
  daftar.push(kini);
  peta.set(kunci, daftar);
  if (peta.size > 5000) for (const [k, v] of peta) if (!v.length || kini - v[v.length - 1] > jendelaMs) peta.delete(k);
  return true;
}

export async function batasi(kunci, maks, jendelaMs) {
  try {
    const { data, error } = await dbServer().rpc("cek_batas", { p_kunci: kunci, p_maks: maks, p_ms: jendelaMs });
    if (!error && typeof data === "boolean") return data;
  } catch {}
  return batasiLokal(kunci, maks, jendelaMs);
}

export async function lepas(kunci) {
  peta.delete(kunci);
  try { await dbServer().from("batas_laju").delete().eq("kunci", kunci); } catch {}
}

export async function ipKlien() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
}
