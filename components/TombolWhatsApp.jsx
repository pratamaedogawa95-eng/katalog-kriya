"use client";
import { toko, linkWA } from "../lib/toko";
import { rupiah } from "../lib/format";
import { catatKlik } from "../app/aksi";

// Jumlah ikut tertulis di pesan (US-12). Klik dicatat untuk statistik admin (US-40).
export default function TombolWhatsApp({ produk, jumlah = 1 }) {
  const pesan = `Halo ${toko.nama}, saya mau pesan:\n${jumlah}x ${produk.nama} @ ${rupiah(produk.harga)}\nTotal: ${rupiah(produk.harga * jumlah)}`;
  return (
    <a href={linkWA(pesan)} target="_blank" rel="noopener noreferrer" onClick={() => { catatKlik(produk.id); }} className="btn-brand w-full py-3.5 text-base sm:w-auto">
      Pesan via WhatsApp
    </a>
  );
}
