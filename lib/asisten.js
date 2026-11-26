import { dimensi, labelPenggunaan, hemat } from "./produk";
import { rupiah } from "./format";

// Asisten produk berbasis aturan: menjawab dari data produk dan info toko, tanpa API luar.
export const PERTANYAAN_CEPAT = [
  "Apakah produk ini ready stock?",
  "Bahan dan ukurannya apa?",
  "Bagaimana opsi pengirimannya?",
  "Bagaimana cara memesan?",
];

const ada = (t, daftar) => daftar.some((k) => t.includes(k));
const kosong = (v) => v === null || v === undefined || String(v).trim() === "";

function kalimatCocok(t, p) {
  const kata = t.split(/[^a-z0-9]+/).filter((k) => k.length > 3);
  if (!kata.length) return null;
  const kalimat = `${p.deskripsi || ""} ${p.perawatan || ""}`.split(/(?<=[.!?])\s+/).filter(Boolean);
  let terbaik = null, skor = 0;
  for (const k of kalimat) {
    const s = kata.filter((w) => k.toLowerCase().includes(w)).length;
    if (s > skor) { skor = s; terbaik = k; }
  }
  return terbaik;
}

export function jawab(tanya, p, toko) {
  const t = tanya.toLowerCase();
  const varian = Array.isArray(p.varian) ? p.varian : [];
  const kePenjual = (teks) => ({ teks, wa: true });
  const belum = "Info itu belum diisi penjual. Tanyakan langsung lewat WhatsApp.";

  if (/^(halo|hai|hi|hallo|selamat|permisi)\b/.test(t) && t.length < 25)
    return { teks: `Halo! Silakan tanya soal stok, bahan, ukuran, atau cara memesan ${p.nama}.` };

  if (ada(t, ["berapa lama", "waktu pembuatan", "pengerjaan", "indent", "custom"]))
    return kosong(p.waktu_pembuatan) ? kePenjual(belum) : { teks: `Waktu pembuatan ${p.nama}: ${p.waktu_pembuatan}.` };

  if (ada(t, ["stok", "ready", "tersedia", "habis", "kosong"])) {
    if ((p.stok ?? 1) > 0) return { teks: `${p.nama} masih tersedia (${p.stok != null ? `${p.stok} unit` : "ada stok"}). Klik “Pesan via WhatsApp” untuk memesan.` };
    return kePenjual(`Maaf, stok ${p.nama} sedang habis. Kamu bisa menanyakan jadwal stok berikutnya ke penjual.`);
  }

  if (ada(t, ["varian", "pilihan ukuran", "opsi ukuran"]))
    return varian.length ? { teks: `Varian ${p.nama}: ${varian.map((v) => `${v.nama} (${rupiah(v.harga)})`).join(", ")}.` } : { teks: "Produk ini belum punya varian; hanya satu pilihan." };

  if (ada(t, ["harga", "diskon", "hemat", "promo", "biaya", "berapa"])) {
    let s = `Harga ${p.nama}: ${rupiah(p.harga)}`;
    if (hemat(p) > 0) s += ` (turun dari ${rupiah(p.harga_coret)}, hemat ${hemat(p)}%)`;
    if (varian.length) s += `. Harga per varian: ${varian.map((v) => `${v.nama} ${rupiah(v.harga)}`).join(", ")}`;
    return { teks: s + "." };
  }

  const bahan = () => {
    const s = [];
    if (!kosong(p.bahan)) s.push(`Bahan: ${p.bahan}.`);
    if (!kosong(p.finishing)) s.push(`Finishing: ${p.finishing}.`);
    if (!kosong(p.warna)) s.push(`Warna: ${p.warna}.`);
    return s.length ? s.join(" ") : null;
  };
  const ukuran = () => {
    const s = [];
    if (dimensi(p)) s.push(`Ukuran: ${dimensi(p)}.`);
    if (!kosong(p.berat_kg)) s.push(`Berat: ${p.berat_kg} kg.`);
    return s.length ? s.join(" ") : null;
  };
  const mB = ada(t, ["bahan", "kayu", "material", "terbuat", "finishing", "warna"]);
  const mU = ada(t, ["ukuran", "dimensi", "panjang", "lebar", "tinggi", "berat", "besar"]);
  if (mB || mU) {
    const bagian = [mB && bahan(), mU && ukuran()].filter(Boolean);
    if (!bagian.length) return kePenjual(belum);
    return { teks: bagian.join(" ") };
  }

  if (ada(t, ["garansi", "jaminan", "retur", "klaim"]))
    return kosong(p.garansi) ? kePenjual(belum) : { teks: `Garansi: ${p.garansi}.` };

  if (ada(t, ["rawat", "bersih", "awet", "tahan", "luntur", "jamur", "rayap", "simpan"])) {
    if (!kosong(p.perawatan)) return { teks: `Perawatan: ${p.perawatan}` };
    const k = kalimatCocok(t, p);
    return k ? { teks: k } : kePenjual(belum);
  }

  if (ada(t, ["outdoor", "indoor", "luar ruangan", "dalam ruangan", "teras", "taman", "hujan"]))
    return labelPenggunaan(p.penggunaan) ? { teks: `${p.nama} cocok untuk penggunaan: ${labelPenggunaan(p.penggunaan)}.` } : kePenjual(belum);

  if (ada(t, ["kirim", "ongkir", "pengiriman", "ekspedisi", "antar", "cod"]))
    return kePenjual("Opsi dan ongkos kirim belum diatur di katalog. Kirim alamat tujuanmu lewat WhatsApp, lalu penjual akan membantu menghitungnya.");

  if (ada(t, ["pesan", "memesan", "pemesanan", "dipesan", "order", "beli", "membeli", "pembelian", "cara", "bayar", "pembayaran", "uang muka"]))
    return { teks: `Cara memesan: pilih jumlah${varian.length ? " dan varian" : ""} di halaman ini, lalu klik “Pesan via WhatsApp”. Pesanan terkirim ke penjual lewat pesan otomatis, dan pembayaran dibicarakan langsung di WhatsApp.` };

  if (ada(t, ["alamat", "lokasi", "dimana", "di mana", "jam buka", "buka", "showroom"]))
    return { teks: `Alamat: ${toko.alamat}. Jam buka: ${toko.jamBuka}.` };

  const k = kalimatCocok(t, p);
  if (k) return { teks: `Dari deskripsi produk: “${k}”` };
  return kePenjual("Maaf, aku belum punya jawaban untuk itu. Tanyakan langsung ke penjual lewat WhatsApp.");
}

// US-14: susun deskripsi dari isian form (berbasis templat, bisa disunting).
export function buatDeskripsi(f) {
  const isi = (k) => (kosong(f[k]) ? null : String(f[k]).trim());
  const nama = isi("nama") || "Produk ini";
  const kat = isi("kategori");
  let s1 = `${nama}${kat ? ` (${kat.toLowerCase()})` : ""} ${isi("bahan") ? `berbahan ${isi("bahan").replace(/^./, (c) => c.toLowerCase())}` : "dibuat oleh pengrajin lokal"}`;
  if (isi("finishing")) s1 += ` dengan finishing ${isi("finishing")}`;
  if (isi("warna")) s1 += `, warna ${isi("warna")}`;
  const bagian = [s1 + "."];
  const pakai = { indoor: "Cocok untuk dipakai di dalam ruangan.", outdoor: "Dirancang untuk area terbuka seperti teras dan taman.", "indoor-outdoor": "Bisa dipakai di dalam maupun di luar ruangan." }[f.penggunaan];
  if (pakai) bagian.push(pakai);
  if (dimensi({ panjang_cm: isi("panjang_cm"), lebar_cm: isi("lebar_cm"), tinggi_cm: isi("tinggi_cm") }))
    bagian.push(`Ukuran ${dimensi({ panjang_cm: isi("panjang_cm"), lebar_cm: isi("lebar_cm"), tinggi_cm: isi("tinggi_cm") })}.`);
  if (isi("waktu_pembuatan")) bagian.push(`Waktu pembuatan ${isi("waktu_pembuatan")}.`);
  if (isi("garansi")) bagian.push(isi("garansi").replace(/\.?$/, "."));
  return bagian.join(" ");
}

// Penjaga topik: asisten hanya melayani hal yang ada di website (produk dan toko ini).
export const pesanLuarTopik = (nama) =>
  `Maaf, aku hanya bisa menjawab pertanyaan seputar ${nama} dan toko ini, seperti stok, harga, bahan, ukuran, pemesanan, atau alamat. Untuk hal lain, silakan hubungi penjual lewat WhatsApp.`;

const TOPIK = ["stok", "ready", "tersedia", "habis", "harga", "diskon", "promo", "hemat", "murah", "mahal", "biaya", "bahan", "kayu", "rotan", "jati", "besi", "kain", "busa", "material", "terbuat", "finishing", "warna", "ukuran", "dimensi", "panjang", "lebar", "tinggi", "berat", "garansi", "retur", "klaim", "rawat", "bersih", "awet", "tahan", "luntur", "jamur", "rayap", "simpan", "indoor", "outdoor", "teras", "taman", "hujan", "kirim", "ongkir", "pengiriman", "ekspedisi", "antar", "pesan", "memesan", "pemesanan", "dipesan", "order", "beli", "membeli", "pembelian", "bayar", "pembayaran", "alamat", "lokasi", "buka", "toko", "showroom", "varian", "pilihan", "pembuatan", "pengerjaan", "custom", "indent", "produk", "barang", "whatsapp", "kontak", "hubungi", "rekomendasi", "cocok", "mirip", "nyaman", "kuat", "desain", "gaya", "minimalis", "ruang", "furnitur", "perabot", "halo", "hai", "terima kasih", "makasih", "permisi"];
const TERLARANG = ["abaikan", "instruksi", "prompt", "ignore", "system", "jailbreak", "bitcoin", "kripto", "crypto", "saham", "presiden", "politik", "pemilu", "puisi", "pantun", "lelucon", "cerita", "coding", "kode program", "javascript", "python", "resep", "obat", "diagnosa", "judi", "senjata", "agama", "terjemah", "pakai model", "chatgpt", "gemini", "claude", "openai", "siapa kamu", "kamu siapa"];

export function dalamTopik(tanya, p, toko) {
  const t = tanya.toLowerCase();
  if (TERLARANG.some((k) => t.includes(k))) return false;
  if (TOPIK.some((k) => t.includes(k))) return true;
  const milik = `${p.nama} ${p.kategori || ""} ${toko?.nama || ""}`.toLowerCase().split(/[^a-z0-9]+/).filter((k) => k.length > 3);
  return milik.some((k) => t.includes(k));
}
