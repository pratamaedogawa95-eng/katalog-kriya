import Header from "../components/Header";
import Footer from "../components/Footer";
import BannerPromo from "../components/BannerPromo";
import Katalog from "../components/Katalog";
import { dbServer } from "../lib/supabase/server";
import Etalase from "../components/Etalase";
import { toko } from "../lib/toko";

export const dynamic = "force-dynamic";

const langkah = [
  ["1", "Lihat", "Klik tanda (+) pada furnitur di ruang display."],
  ["2", "Pilih", "Baca detail dan harga, lalu pesan lewat WhatsApp."],
  ["3", "Coba", "Pasang produk di foto ruanganmu lewat simulasi."],
];

export default async function Beranda() {
  let data = null, error = null, ruangan = [];
  try {
    const db = dbServer();
    ({ data, error } = await db.from("produk").select("*").eq("aktif", true).order("urutan").order("created_at", { ascending: false }));
    ({ data: ruangan } = await db.from("ruangan").select("*, tanda(id, produk_id, x, y)").order("id"));
  } catch { error = true; } // koneksi database belum terpasang atau gagal
  return (
    <>
      <BannerPromo />
      <Header />
      <main>
        <section className="bg-teak text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
            <div>
              <h1 className="font-display text-4xl font-bold leading-[1.1] md:text-6xl">{toko.tagline}.</h1>
              <p className="mt-5 max-w-lg text-lg text-stone-300">Pilih produk dari katalog, lalu pesan langsung lewat WhatsApp. Tanpa daftar akun, tanpa ribet.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#display" className="btn bg-kuningan px-6 py-3 text-teak hover:bg-amber-300">Jelajahi ruangan</a>
                <a href="#simulasi" className="btn border border-white/30 px-6 py-3 text-white hover:bg-white/10">Coba simulasi</a>
              </div>
            </div>
            <ol className="grid gap-3 self-center">
              {langkah.map(([n, judul, isi]) => (
                <li key={n} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-kuningan font-display font-bold text-teak">{n}</span>
                  <div><p className="font-semibold">{judul}</p><p className="text-sm text-stone-300">{isi}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        {!error && data.length > 0 && <Etalase produk={data} ruangan={ruangan || []} />}
        {error ? (
          <p className="mx-auto my-14 max-w-xl rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-800">Katalog belum bisa dimuat. Periksa koneksi database, lalu muat ulang halaman.</p>
        ) : data.length === 0 ? (
          <p className="mx-auto my-14 max-w-xl text-center text-redam">Belum ada produk.</p>
        ) : (
          <Katalog produk={data} />
        )}
      </main>
      <Footer />
    </>
  );
}
