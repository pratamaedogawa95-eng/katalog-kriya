"use server";
import { dbServer } from "../lib/supabase/server";
import { batasi, ipKlien } from "../lib/batas";
import { jawab, dalamTopik, pesanLuarTopik } from "../lib/asisten";
import { jawabAI } from "../lib/asisten-ai";
import { ambilToko } from "../lib/toko-server";

// US-40: catat klik tombol WhatsApp. Publik, jadi dibatasi per IP dan hanya menerima id angka.
export async function catatKlik(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return;
  if (!(await batasi(`klik:${await ipKlien()}`, 30, 60_000))) return;
  try { await dbServer().from("klik_wa").insert({ produk_id: n }); } catch {}
}

// US-38: kirim ulasan. Publik, jadi: kolom jebakan (honeypot), batas 3 ulasan/10 menit per IP, validasi ketat,
// dan status awal "menunggu" sampai disetujui admin (US-39).
export async function kirimUlasan(_, fd) {
  if (String(fd.get("situs") || "")) return { ok: "Terima kasih!" }; // bot mengisi kolom tersembunyi
  const produk_id = Number(fd.get("produk_id"));
  const nama = String(fd.get("nama") || "").trim().slice(0, 40);
  const isi = String(fd.get("isi") || "").trim().slice(0, 600);
  const rating = Number(fd.get("rating"));
  if (!Number.isInteger(produk_id) || produk_id <= 0) return { error: "Produk tidak valid." };
  if (!nama) return { error: "Nama wajib diisi." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Pilih rating 1 sampai 5." };
  if (isi.length < 10) return { error: "Ulasan minimal 10 karakter." };
  if (!(await batasi(`ulasan:${await ipKlien()}`, 3, 10 * 60_000))) return { error: "Terlalu banyak ulasan. Coba lagi beberapa menit lagi." };
  try {
    const db = dbServer();
    const { data: ada } = await db.from("produk").select("id").eq("id", produk_id).eq("aktif", true).maybeSingle();
    if (!ada) return { error: "Produk tidak ditemukan." };
    const { error } = await db.from("ulasan").insert({ produk_id, nama, rating, isi, status: "menunggu" });
    if (error) return { error: "Ulasan belum bisa dikirim. Coba lagi nanti." };
  } catch { return { error: "Ulasan belum bisa dikirim. Coba lagi nanti." }; }
  return { ok: "Terima kasih! Ulasanmu akan tampil setelah disetujui admin." };
}

// US-50: asisten tanya jawab produk. Publik, jadi: batas 15 pertanyaan/menit per IP, id dan panjang teks divalidasi,
// data produk diambil dari database di server (bukan dari browser). Memakai Gemini bila GEMINI_API_KEY ada, bila tidak atau gagal, memakai asisten berbasis aturan.
export async function tanyaAsistenProduk(produkId, pertanyaan) {
  const id = Number(produkId);
  const q = String(pertanyaan || "").trim().slice(0, 200);
  if (!Number.isInteger(id) || id <= 0 || !q) return { error: "Pertanyaan tidak valid." };
  if (!(await batasi(`asisten:${await ipKlien()}`, 15, 60_000))) return { error: "Terlalu banyak pertanyaan. Coba lagi sebentar lagi." };
  try {
    const { data: p } = await dbServer().from("produk").select("*").eq("id", id).eq("aktif", true).maybeSingle();
    if (!p) return { error: "Produk tidak ditemukan." };
    const t = await ambilToko();
    const toko = { nama: t.nama, alamat: t.alamat, jamBuka: t.jamBuka, nomorWhatsApp: t.nomorWhatsApp };
    if (!dalamTopik(q, p, toko)) return { jawaban: pesanLuarTopik(p.nama) };
    const ai = await jawabAI(q, p, toko);
    if (ai && ai.includes("LUAR_TOPIK")) return { jawaban: pesanLuarTopik(p.nama) };
    if (ai) return { jawaban: ai };
    const j = jawab(q, p, toko);
    return { jawaban: j.teks, wa: Boolean(j.wa) };
  } catch { return { error: "Asisten belum bisa menjawab. Coba lagi nanti." }; }
}
