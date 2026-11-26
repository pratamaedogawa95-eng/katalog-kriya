import FormUlasan from "./FormUlasan";
import { dbServer } from "../lib/supabase/server";

// US-38: ulasan yang sudah disetujui admin (status "tampil") + formulir. Teks ditampilkan sebagai teks biasa (aman dari XSS).
export default async function UlasanProduk({ produkId }) {
  let daftar = [];
  try {
    const { data } = await dbServer().from("ulasan").select("id, nama, rating, isi, created_at").eq("produk_id", produkId).eq("status", "tampil").order("created_at", { ascending: false }).limit(30);
    daftar = data || [];
  } catch {}
  const rata = daftar.length ? daftar.reduce((a, u) => a + u.rating, 0) / daftar.length : 0;
  const tgl = (t) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(t));
  return (
    <section className="mt-14" aria-labelledby="judul-ulasan">
      <h2 id="judul-ulasan" className="font-display text-2xl font-bold">Ulasan</h2>
      {daftar.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-redam"><b className="text-tinta">{rata.toFixed(1).replace(".", ",")}</b> dari 5 · {daftar.length} ulasan</p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {daftar.map((u) => (
              <li key={u.id} className="panel p-4">
                <p className="text-brand" aria-label={`Rating ${u.rating} dari 5`}>{"★".repeat(u.rating)}<span className="text-stone-300">{"★".repeat(5 - u.rating)}</span></p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{u.isi}</p>
                <p className="mt-2 text-xs text-redam">{u.nama} · {tgl(u.created_at)}</p>
              </li>
            ))}
          </ul>
        </>
      ) : <p className="mt-2 text-sm text-redam">Belum ada ulasan. Jadilah yang pertama.</p>}
      <FormUlasan produkId={produkId} />
    </section>
  );
}
