import { dbServer } from "../lib/supabase/server";
import { slugKategori } from "../lib/produk";

const BASE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://katalog-kriya.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  let produk = [];
  try {
    const { data } = await dbServer().from("produk").select("id, created_at, kategori");
    produk = data || [];
  } catch {}
  const kategori = [...new Set(produk.map((p) => p.kategori).filter(Boolean).map(slugKategori))];
  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    ...kategori.map((k) => ({ url: `${BASE}/kategori/${k}`, changeFrequency: "weekly", priority: 0.8 })),
    ...produk.map((p) => ({ url: `${BASE}/produk/${p.id}`, lastModified: p.created_at, priority: 0.7 })),
  ];
}
