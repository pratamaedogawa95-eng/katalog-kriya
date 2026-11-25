import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Koneksi sesi admin (kunci publishable + cookie login). RLS tetap berlaku.
export async function dbSesi() {
  const jar = await cookies();
  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(daftar) {
        try { daftar.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {}
      },
    },
  });
}
