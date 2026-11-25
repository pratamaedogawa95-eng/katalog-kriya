import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Foto from "../../../components/Foto";
import TombolWhatsApp from "../../../components/TombolWhatsApp";
import { dbServer } from "../../../lib/supabase/server";
import { rupiah } from "../../../lib/format";

export const dynamic = "force-dynamic";

async function ambil(id) {
  if (!/^\d+$/.test(id)) return null;
  try {
    const { data } = await dbServer().from("produk").select("*").eq("id", id).maybeSingle();
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
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <Link href="/#katalog" className="text-sm font-medium text-brand hover:underline">← Kembali ke katalog</Link>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <Foto src={p.foto_url} alt={p.nama} className="aspect-square w-full rounded-2xl border border-garis" />
          <div className="flex flex-col gap-4 self-center">
            {p.kategori && <span className="w-fit rounded-md bg-stone-200 px-2.5 py-1 text-xs font-semibold">{p.kategori}</span>}
            <h1 className="font-display text-3xl font-bold md:text-4xl">{p.nama}</h1>
            <p className="font-display text-3xl font-bold text-brand">{rupiah(p.harga)}</p>
            {p.deskripsi && <p className="max-w-prose leading-relaxed text-redam">{p.deskripsi}</p>}
            {(p.stok ?? 1) > 0 ? (
              <p className="text-sm font-medium text-emerald-700">Stok tersedia: {p.stok ?? "–"}</p>
            ) : (
              <p className="w-fit rounded-md bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">Stok habis</p>
            )}
            <div className="pt-2">
              {(p.stok ?? 1) > 0 ? (
                <TombolWhatsApp produk={p} />
              ) : (
                <button type="button" disabled className="btn-brand w-full cursor-not-allowed py-3.5 text-base opacity-50 sm:w-auto">Stok habis</button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
