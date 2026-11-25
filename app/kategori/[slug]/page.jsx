import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Katalog from "../../../components/Katalog";
import { dbServer } from "../../../lib/supabase/server";
import { slugKategori } from "../../../lib/produk";

export const dynamic = "force-dynamic";

// Halaman per kategori (US-49): /kategori/kursi, /kategori/lemari-dan-rak, dst.
async function ambil(slug) {
  try {
    const { data } = await dbServer().from("produk").select("*").not("kategori", "is", null).order("created_at", { ascending: false });
    const semua = data || [];
    const daftar = semua.filter((p) => slugKategori(p.kategori) === slug);
    return daftar.length ? { nama: daftar[0].kategori, daftar, lain: [...new Set(semua.map((p) => p.kategori))].filter((k) => slugKategori(k) !== slug) } : null;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const k = await ambil((await params).slug);
  if (!k) return {};
  const deskripsi = `${k.daftar.length} produk ${k.nama} buatan tangan. Pesan langsung lewat WhatsApp.`;
  return { title: `${k.nama} handmade`, description: deskripsi, openGraph: { title: k.nama, description: deskripsi, type: "website" } };
}

export default async function HalamanKategori({ params }) {
  const k = await ambil((await params).slug);
  if (!k) notFound();
  return (
    <>
      <Header />
      <main>
        <Katalog produk={k.daftar} judul={k.nama} intro={`${k.daftar.length} produk ${k.nama.toLowerCase()} buatan tangan untuk indoor maupun outdoor.`} linkKategori={false} />
        <nav aria-label="Kategori lain" className="mx-auto max-w-6xl px-5 pb-14">
          <p className="text-sm font-semibold">Kategori lain</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {k.lain.map((n) => <a key={n} href={`/kategori/${slugKategori(n)}`} className="btn-garis rounded-full px-4 py-1.5">{n}</a>)}
            <a href="/#katalog" className="btn-garis rounded-full px-4 py-1.5">Semua produk</a>
          </div>
        </nav>
      </main>
      <Footer />
    </>
  );
}
