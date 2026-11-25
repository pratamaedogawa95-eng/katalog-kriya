import { dbSesi } from "../../../lib/supabase/sesi";

export const dynamic = "force-dynamic";

const kolom = ["id", "nama", "kategori", "harga", "stok", "deskripsi", "foto_url", "created_at"];

// Kutip nilai CSV; awalan = + - @ diberi tanda kutip agar tidak dibaca sebagai rumus di Excel.
function sel(v) {
  let t = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
  return '"' + t.replace(/"/g, '""') + '"';
}

export async function GET() {
  const sb = await dbSesi();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Tidak diizinkan.", { status: 401 });

  const { data, error } = await sb.from("produk").select("*").order("id");
  if (error) return new Response("Gagal mengekspor data.", { status: 500 });

  const baris = [kolom.join(",")].concat((data || []).map((p) => kolom.map((k) => sel(p[k])).join(",")));
  return new Response("\uFEFF" + baris.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="produk-kala-karsa.csv"',
      "Cache-Control": "no-store",
    },
  });
}
