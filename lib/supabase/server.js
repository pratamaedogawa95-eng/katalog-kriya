import { createClient } from "@supabase/supabase-js";

// Koneksi server untuk pengunjung (kunci rahasia, hanya dipakai membaca data publik).
export function dbServer() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false },
  });
}
