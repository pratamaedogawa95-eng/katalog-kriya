"use server";
import { dbServer } from "../lib/supabase/server";
import { batasi, ipKlien } from "../lib/batas";

// US-40: catat klik tombol WhatsApp. Publik, jadi dibatasi per IP dan hanya menerima id angka.
export async function catatKlik(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return;
  if (!(await batasi(`klik:${await ipKlien()}`, 30, 60_000))) return;
  try { await dbServer().from("klik_wa").insert({ produk_id: n }); } catch {}
}
