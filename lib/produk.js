// Pembantu data produk furnitur: slug kategori, label, dan rangkaian dimensi.
export const PENGGUNAAN = [
  ["indoor", "Indoor"],
  ["outdoor", "Outdoor"],
  ["indoor-outdoor", "Indoor & outdoor"],
];

export const labelPenggunaan = (v) => PENGGUNAAN.find(([k]) => k === v)?.[1] ?? null;

export function slugKategori(nama = "") {
  return String(nama)
    .toLowerCase()
    .replace(/&/g, " dan ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// "P 120 × L 60 × T 75 cm", atau null bila belum lengkap.
export function dimensi(p) {
  const { panjang_cm: a, lebar_cm: b, tinggi_cm: c } = p;
  if (![a, b, c].every((n) => n !== null && n !== undefined && n !== "")) return null;
  return `P ${a} × L ${b} × T ${c} cm`;
}

// Persentase hemat bila ada harga coret yang valid.
export function hemat(p) {
  if (!p.harga_coret || p.harga_coret <= p.harga) return 0;
  return Math.round((1 - p.harga / p.harga_coret) * 100);
}
