import { toko, linkWA } from "../lib/toko";
import { rupiah } from "../lib/format";

export default function TombolWhatsApp({ produk }) {
  const pesan = `Halo ${toko.nama}, saya mau pesan ${produk.nama} (${rupiah(produk.harga)}).`;
  return (
    <a href={linkWA(pesan)} target="_blank" rel="noopener noreferrer" className="btn-brand w-full py-3.5 text-base sm:w-auto">
      Pesan via WhatsApp
    </a>
  );
}
