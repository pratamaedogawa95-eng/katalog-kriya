import { headers } from "next/headers";

// Pembatas laju sederhana (jendela geser, per instance server).
const peta = new Map();

export function batasi(kunci, maks, jendelaMs) {
  const kini = Date.now();
  const daftar = (peta.get(kunci) || []).filter((t) => kini - t < jendelaMs);
  if (daftar.length >= maks) { peta.set(kunci, daftar); return false; }
  daftar.push(kini);
  peta.set(kunci, daftar);
  if (peta.size > 5000) for (const [k, v] of peta) if (!v.length || kini - v[v.length - 1] > jendelaMs) peta.delete(k);
  return true;
}
export const lepas = (kunci) => peta.delete(kunci);

export async function ipKlien() {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || "lokal";
}
