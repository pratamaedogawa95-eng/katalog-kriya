export const toko = {
  nama: "Kala & Karsa",
  tagline: "Kriya dan rasa Nusantara, dibuat dengan tangan",
  deskripsi: "Katalog produk Kala & Karsa. Pilih produk, lalu pesan langsung lewat WhatsApp.",
  alamat: "Jl. Contoh No. 12, Malang, Jawa Timur",
  jamBuka: "Setiap hari, 08.00–20.00 WIB",
  nomorWhatsApp: "6281234567890", // format internasional, tanpa + dan tanpa 0 di depan
};
export const linkWA = (teks) => `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(teks)}`;
