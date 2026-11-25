import Link from "next/link";
import NavAdmin from "../../components/NavAdmin";
import Foto from "../../components/Foto";
import { TombolHapus } from "../../components/FormAdmin";
import { dbSesi } from "../../lib/supabase/sesi";
import { rupiah } from "../../lib/format";
import { hapusProduk } from "./actions";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const sb = await dbSesi();
  const { data, error } = await sb.from("produk").select("*").order("created_at", { ascending: false });
  const { count: nRuang } = await sb.from("ruangan").select("*", { count: "exact", head: true });
  const { count: nTanda } = await sb.from("tanda").select("*", { count: "exact", head: true });
  const l = data || [];
  const harga = l.map((p) => p.harga);
  const st = (p) => p.stok ?? 0;
  const ringkas = [
    ["Produk", l.length],
    ["Total stok", l.reduce((a, p) => a + st(p), 0)],
    ["Stok habis", l.filter((p) => st(p) === 0).length],
    ["Stok menipis (≤ 5)", l.filter((p) => st(p) > 0 && st(p) <= 5).length],
    ["Kategori", new Set(l.map((p) => p.kategori).filter(Boolean)).size],
    ["Ruangan", nRuang ?? 0],
    ["Tanda (+)", nTanda ?? 0],
    ["Nilai stok", rupiah(l.reduce((a, p) => a + p.harga * st(p), 0))],
  ];
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Ringkasan toko</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ringkas.map(([k, v]) => <div key={k} className="panel p-4"><p className="text-sm text-redam">{k}</p><p className="mt-1 font-display text-xl font-bold">{v}</p></div>)}
        </div>
        <div className="mt-10 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Produk</h2>
          <div className="flex gap-2">
            <a href="/admin/ekspor" className="btn-garis">Ekspor CSV</a>
            <Link href="/admin/produk/baru" className="btn-brand">Tambah produk</Link>
          </div>
        </div>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Produk gagal dimuat. Muat ulang halaman.</p>}
        <ul className="panel mt-4 divide-y divide-garis">
          {l.length === 0 && !error && <li className="p-8 text-center text-redam">Belum ada produk. Klik “Tambah produk”.</li>}
          {l.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <Foto src={p.foto_url} alt="" className="size-14 rounded-lg" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.nama}</p><p className="text-sm text-redam">{p.kategori || "Tanpa kategori"} · {rupiah(p.harga)} · Stok {p.stok ?? "–"}</p></div>
              <div className="flex gap-2"><Link href={`/admin/produk/${p.id}/ubah`} className="btn-garis px-3 py-1.5">Ubah</Link><TombolHapus aksi={hapusProduk} id={p.id} nama={p.nama} /></div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
