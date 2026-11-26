import Link from "next/link";
import { ambilToko } from "../lib/toko-server";

export default async function Footer() {
  const toko = await ambilToko();
  const linkWA = (t) => `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(t)}`;
  return (
    <footer id="kontak" className="bg-teak text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div id="tentang">
          <h2 className="font-display text-xl font-bold text-white">Tentang {toko.nama}</h2>
          <p className="mt-3 text-sm leading-relaxed">{toko.deskripsi}</p>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Hubungi kami</h2>
          <p className="mt-3 text-sm leading-relaxed">Tanya stok, harga, atau pengiriman lewat WhatsApp.</p>
          <a href={linkWA(`Halo ${toko.nama}, saya mau bertanya.`)} target="_blank" rel="noopener noreferrer" className="btn mt-4 bg-kuningan text-teak hover:bg-amber-300">Chat WhatsApp</a>
        </div>
        <div className="text-sm leading-relaxed">
          <h2 className="font-display text-xl font-bold text-white">Kunjungi toko</h2>
          <p className="mt-3">{toko.alamat}</p>
          <p>{toko.jamBuka}</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs">
        © {new Date().getFullYear()} {toko.nama} ·{" "}
        <Link href="/admin/login" className="underline hover:text-white">Masuk sebagai admin</Link>
      </div>
    </footer>
  );
}
