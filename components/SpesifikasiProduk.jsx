import { dimensi, labelPenggunaan } from "../lib/produk";

// Tabel spesifikasi standar furnitur. Baris yang datanya kosong tidak ditampilkan.
export default function SpesifikasiProduk({ p }) {
  const baris = [
    ["Penggunaan", labelPenggunaan(p.penggunaan)],
    ["Bahan", p.bahan],
    ["Finishing", p.finishing],
    ["Warna", p.warna],
    ["Dimensi (P × L × T)", dimensi(p)],
    ["Berat", p.berat_kg ? `${String(p.berat_kg).replace(".", ",")} kg` : null],
    ["Waktu pembuatan", p.waktu_pembuatan],
    ["Garansi", p.garansi],
  ].filter(([, v]) => v);
  if (baris.length === 0 && !p.perawatan) return null;
  return (
    <section aria-labelledby="judul-spek" className="mt-14 grid gap-8 md:grid-cols-2">
      {baris.length > 0 && (
        <div>
          <h2 id="judul-spek" className="font-display text-2xl font-bold">Spesifikasi</h2>
          <dl className="panel mt-4 divide-y divide-garis text-sm">
            {baris.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3"><dt className="text-redam">{k}</dt><dd className="font-medium">{v}</dd></div>
            ))}
          </dl>
        </div>
      )}
      <div>
        <h2 className="font-display text-2xl font-bold">Perawatan &amp; pemesanan</h2>
        <ul className="panel mt-4 list-disc space-y-2 py-4 pl-9 pr-4 text-sm leading-relaxed">
          {p.perawatan && <li>{p.perawatan}</li>}
          <li>Dibuat dengan tangan, sehingga serat kayu dan anyaman tiap produk sedikit berbeda.</li>
          <li>Pemesanan, ongkos kirim, dan pembayaran dikonfirmasi lewat WhatsApp.</li>
        </ul>
      </div>
    </section>
  );
}
