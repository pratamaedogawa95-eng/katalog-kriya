import Link from "next/link";
import NavAdmin from "../../components/NavAdmin";
import Foto from "../../components/Foto";
import { TombolHapus } from "../../components/FormAdmin";
import { dbSesi } from "../../lib/supabase/sesi";
import { rupiah } from "../../lib/format";
import { labelPenggunaan } from "../../lib/produk";
import { hapusProduk, ubahAktif } from "./actions";

export const dynamic = "force-dynamic";
const PER = 10; // produk per halaman di admin

export default async function Admin({ searchParams }) {
  const sp = await searchParams;
  // Buang karakter yang bermakna khusus di filter PostgREST agar pencarian tidak bisa dipakai menyisipkan filter lain.
  const q = String(sp?.q ?? "").replace(/[,()%*\\:"']/g, " ").trim().slice(0, 60);
  const hal = Math.max(1, Number.parseInt(sp?.hal, 10) || 1);

  const sb = await dbSesi();
  // Ringkasan memakai semua produk (kolom ringan saja); daftar memakai pencarian + paginasi (US-33).
  const { data: semua } = await sb.from("produk").select("id, nama, harga, stok, kategori, aktif");
  // US-41: klik WhatsApp 30 hari terakhir, dihitung per produk.
  const sejak = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: klik } = await sb.from("klik_wa").select("produk_id").gte("created_at", sejak).limit(10000);
  let kueri = sb.from("produk").select("*", { count: "exact" }).order("created_at", { ascending: false });
  if (q) kueri = kueri.or(`nama.ilike.%${q}%,kategori.ilike.%${q}%`);
  const { data, error, count } = await kueri.range((hal - 1) * PER, hal * PER - 1);
  const { count: nRuang } = await sb.from("ruangan").select("*", { count: "exact", head: true });
  const { count: nUlasan } = await sb.from("ulasan").select("*", { count: "exact", head: true }).eq("status", "menunggu");
  const { count: nTanda } = await sb.from("tanda").select("*", { count: "exact", head: true });

  const l = semua || [];
  const st = (p) => p.stok ?? 0;
  const ringkas = [
    ["Produk", l.length],
    ["Total stok", l.reduce((a, p) => a + st(p), 0)],
    ["Stok habis", l.filter((p) => st(p) === 0).length],
    ["Stok menipis (≤ 5)", l.filter((p) => st(p) > 0 && st(p) <= 5).length],
    ["Kategori", new Set(l.map((p) => p.kategori).filter(Boolean)).size],
    ["Ruangan", nRuang ?? 0],
    ["Tanda (+)", nTanda ?? 0],
    ["Ulasan menunggu", nUlasan ?? 0],
    ["Nilai stok", rupiah(l.reduce((a, p) => a + p.harga * st(p), 0))],
  ];
  const hitung = {};
  (klik || []).forEach((k) => { hitung[k.produk_id] = (hitung[k.produk_id] || 0) + 1; });
  const terlaris = l.map((p) => [p.nama, hitung[p.id] || 0]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const jmlHal = Math.max(1, Math.ceil((count ?? 0) / PER));
  const tautan = (n) => `/admin?${new URLSearchParams({ ...(q ? { q } : {}), hal: String(n) })}`;
  const daftar = data || [];

  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Ringkasan toko</h1>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {ringkas.map(([k, v]) => <div key={k} className="panel p-4"><p className="text-sm text-redam">{k}</p><p className="mt-1 font-display text-xl font-bold">{v}</p></div>)}
        </div>
        <section className="panel mt-6 p-5" aria-labelledby="judul-terlaris">
          <h2 id="judul-terlaris" className="font-display text-xl font-bold">Produk terlaris <span className="text-sm font-normal text-redam">(klik WhatsApp 30 hari terakhir: {(klik || []).length})</span></h2>
          {terlaris.length === 0 ? <p className="mt-3 text-sm text-redam">Belum ada klik. Angka muncul setelah pengunjung menekan “Pesan via WhatsApp” di halaman produk.</p> : (
            <ol className="mt-3 space-y-2 text-sm">{terlaris.map(([nama, n], i) => <li key={nama} className="flex justify-between gap-3"><span className="truncate">{i + 1}. {nama}</span><b>{n} klik</b></li>)}</ol>
          )}
        </section>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Produk</h2>
          <div className="flex gap-2">
            <a href="/admin/ekspor" className="btn-garis">Ekspor CSV</a>
            <Link href="/admin/impor" className="btn-garis">Impor CSV</Link>
            <Link href="/admin/produk/baru" className="btn-brand">Tambah produk</Link>
          </div>
        </div>
        <form action="/admin" method="get" role="search" className="mt-4 flex gap-2">
          <input name="q" defaultValue={q} placeholder="Cari nama atau kategori" aria-label="Cari produk" maxLength={60} className="input" />
          <button className="btn-garis">Cari</button>
          {q && <Link href="/admin" className="btn-garis">Reset</Link>}
        </form>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Produk gagal dimuat. Muat ulang halaman.</p>}
        <ul className="panel mt-4 divide-y divide-garis">
          {daftar.length === 0 && !error && <li className="p-8 text-center text-redam">{q ? `Tidak ada produk untuk “${q}”.` : "Belum ada produk. Klik “Tambah produk”."}</li>}
          {daftar.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 p-4">
              <Foto src={p.foto_url} alt="" className="size-14 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.nama}{p.aktif === false && <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 align-middle text-xs font-bold text-redam">Nonaktif</span>}{p.badge && <span className="ml-2 rounded bg-brand px-1.5 py-0.5 align-middle text-xs font-bold text-white">{p.badge}</span>}</p>
                <p className="text-sm text-redam">{p.kategori || "Tanpa kategori"}{labelPenggunaan(p.penggunaan) ? ` · ${labelPenggunaan(p.penggunaan)}` : ""} · {rupiah(p.harga)} · Stok {p.stok ?? "–"}</p>
              </div>
              <div className="flex gap-2"><form action={ubahAktif}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="aktif" value={p.aktif === false ? "true" : "false"} /><button className="btn-garis px-3 py-1.5">{p.aktif === false ? "Aktifkan" : "Nonaktifkan"}</button></form><Link href={`/admin/produk/${p.id}/ubah`} className="btn-garis px-3 py-1.5">Ubah</Link><TombolHapus aksi={hapusProduk} id={p.id} nama={p.nama} /></div>
            </li>
          ))}
        </ul>
        {jmlHal > 1 && (
          <nav aria-label="Halaman produk admin" className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            {hal > 1 && <Link href={tautan(hal - 1)} className="btn-garis px-3 py-1.5">← Sebelumnya</Link>}
            <span className="px-2 text-redam">Halaman {Math.min(hal, jmlHal)} dari {jmlHal} · {count} produk</span>
            {hal < jmlHal && <Link href={tautan(hal + 1)} className="btn-garis px-3 py-1.5">Berikutnya →</Link>}
          </nav>
        )}
      </main>
    </>
  );
}
