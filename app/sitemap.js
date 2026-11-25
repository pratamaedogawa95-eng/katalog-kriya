import { dbServer } from "../lib/supabase/server";

const BASE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://katalog-kriya.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let produk = [];
  try {
    const { data } = await dbServer().from("produk").select("id, created_at");
    produk = data || [];
  } catch {}
  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    ...produk.map((p) => ({ url: `${BASE}/produk/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
  ];
}
