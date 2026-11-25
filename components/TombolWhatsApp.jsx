import { toko, linkWA } from "../lib/toko";
import { rupiah } from "../lib/format";

// Jumlah ikut tertulis di pesan WhatsApp (US-12).
export default function TombolWhatsApp({ produk, jumlah = 1 }) {
  const pesan = `Halo ${toko.nama}, saya mau pesan:\n${jumlah}x ${produk.nama} @ ${rupiah(produk.harga)}\nTotal: ${rupiah(produk.harga * jumlah)}`;
  return (
    <a href={linkWA(pesan)} target="_blank" rel="noopener noreferrer" className="btn-brand w-full py-3.5 text-base sm:w-auto">
      Pesan via WhatsApp
    </a>
  );
}
