import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Foto from "../../../components/Foto";
import GaleriProduk from "../../../components/GaleriProduk";
import TombolBagikan from "../../../components/TombolBagikan";
import PesanProduk from "../../../components/PesanProduk";
import UlasanProduk from "../../../components/UlasanProduk";
import SpesifikasiProduk from "../../../components/SpesifikasiProduk";
import AsistenProduk from "../../../components/AsistenProduk";
import CatatDilihat from "../../../components/CatatDilihat";
import { ambilToko } from "../../../lib/toko-server";
import { dbServer } from "../../../lib/supabase/server";
import { rupiah } from "../../../lib/format";
import { slugKategori, hemat } from "../../../lib/produk";

export const dynamic = "force-dynamic";

async function ambil(id) {
  if (!/^\d+$/.test(id)) return null;
  try {
    const { data } = await dbServer().from("produk").select("*").eq("id", id).eq("aktif", true).maybeSingle();
    return data;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const p = await ambil((await params).id);
  if (!p) return {};
  const deskripsi = p.deskripsi || undefined;
  const foto = /^https:\/\//.test(p.foto_url || "") ? [p.foto_url] : undefined;
  return {
    title: p.nama,
    description: deskripsi,
    openGraph: { title: p.nama, description: deskripsi, type: "website", images: foto },
    twitter: { card: foto ? "summary_large_image" : "summary", title: p.nama, description: deskripsi },
  };
}

export default async function Detail({ params }) {
  const p = await ambil((await params).id);
  if (!p) notFound();
  const toko = await ambilToko();
  let terkait = [];
  if (p.kategori) {
    try {
      const { data } = await dbServer().from("produk").select("id, nama, harga, foto_url, harga_coret").eq("kategori", p.kategori).eq("aktif", true).neq("id", p.id).limit(3);
      terkait = data || [];
    } catch {}
  }
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/#katalog" className="text-sm font-medium text-brand hover:underline">← Kembali ke katalog</Link>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <CatatDilihat id={p.id} />
          <GaleriProduk fotos={[p.foto_url, ...(p.foto_tambahan || [])]} alt={p.nama} />
          <div className="flex flex-col gap-4 self-center">
            <div className="flex flex-wrap gap-2">
              {p.kategori && <Link href={`/kategori/${slugKategori(p.kategori)}`} className="w-fit rounded-md bg-stone-200 px-2.5 py-1 text-xs font-semibold hover:bg-stone-100">{p.kategori}</Link>}
              {p.badge && <span className="w-fit rounded-md bg-brand px-2.5 py-1 text-xs font-bold text-white">{p.badge}</span>}
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{p.nama}</h1>
            <div>
              {hemat(p) > 0 && <p className="text-sm text-redam"><s>{rupiah(p.harga_coret)}</s> <b className="text-brand">Hemat {hemat(p)}%</b></p>}
              <p className="font-display text-3xl font-bold text-brand">{Array.isArray(p.varian) && p.varian.length > 0 && <span className="block text-sm font-normal text-redam">Mulai dari</span>}{rupiah(p.harga)}</p>
            </div>
            {p.deskripsi && <p className="max-w-prose leading-relaxed text-redam">{p.deskripsi}</p>}
            {(p.stok ?? 1) > 0 ? (
              <p className="text-sm font-medium text-emerald-700">Stok tersedia: {p.stok ?? "–"}</p>
            ) : (
              <p className="w-fit rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">Stok habis</p>
            )}
            <div className="pt-2">
              {(p.stok ?? 1) > 0 ? (
                <PesanProduk produk={p} />
              ) : (
                <div className="flex flex-wrap items-center gap-2"><button type="button" disabled className="btn-brand w-full cursor-not-allowed py-3.5 text-base opacity-50 sm:w-auto">Stok habis</button><TombolBagikan judul={p.nama} /></div>
              )}
            </div>
          </div>
        </div>
        <SpesifikasiProduk p={p} />
        <AsistenProduk p={{ id: p.id, nama: p.nama }} toko={{ nama: toko.nama, nomorWhatsApp: toko.nomorWhatsApp }} />
        <UlasanProduk produkId={p.id} />
        {terkait.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-bold">Produk terkait</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {terkait.map((r) => (
                <Link key={r.id} href={`/produk/${r.id}`} className="panel overflow-hidden hover:shadow-lg">
                  <Foto src={r.foto_url} alt={r.nama} className="aspect-square w-full" />
                  <div className="p-3"><p className="truncate font-semibold">{r.nama}</p><p className="font-bold text-brand">{rupiah(r.harga)}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
