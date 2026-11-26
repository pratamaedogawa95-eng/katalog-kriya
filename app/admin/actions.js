"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dbSesi } from "../../lib/supabase/sesi";
import { batasi, batasiLokal, lepas, ipKlien } from "../../lib/batas";
import { catat } from "../../lib/log";
import { bacaCsv } from "../../lib/csv";
import { dbServer } from "../../lib/supabase/server";
import { buatDeskripsi } from "../../lib/asisten";
import { deskripsiAI } from "../../lib/asisten-ai";

async function wajibAdmin() {
  const sb = await dbSesi();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!batasiLokal(`aksi:${user.id}`, 60, 60_000)) throw new Error("Terlalu banyak permintaan.");
  return sb;
}

export async function masuk(_, fd) {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const kIp = `login-ip:${await ipKlien()}`, kEmail = `login-email:${email}`;
  if (!(await batasi(kIp, 10, 15 * 60_000)) || !(await batasi(kEmail, 5, 15 * 60_000)))
    return { error: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit." };
  const sb = await dbSesi();
  const { error } = await sb.auth.signInWithPassword({
    email,
    password: String(fd.get("password") || ""),
  });
  if (error) return { error: "Email atau password salah." };
  await lepas(kEmail);
  await catat(sb, "Masuk");
  redirect("/admin");
}

export async function keluar() {
  const sb = await dbSesi();
  await sb.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(_, fd) {
  const sb = await wajibAdmin();
  const baru = String(fd.get("baru") || "");
  if (baru.length < 8) return { error: "Password baru minimal 8 karakter." };
  if (baru !== String(fd.get("ulang") || "")) return { error: "Konfirmasi password tidak sama." };
  const { error } = await sb.auth.updateUser({ password: baru });
  if (error) return { error: "Gagal mengganti password. Coba lagi." };
  return { ok: "Password berhasil diganti." };
}

// Validasi di server (US-34): panjang teks, rentang angka, dan bentuk link foto.
const PENGGUNAAN_SAH = ["indoor", "outdoor", "indoor-outdoor"];

function bacaProduk(fd) {
  const teks = (k, maks) => String(fd.get(k) || "").trim().slice(0, maks) || null;
  const angka = (k) => { const v = String(fd.get(k) ?? "").trim(); return v === "" ? null : Number(v.replace(",", ".")); };
  const d = {
    nama: teks("nama", 120), kategori: teks("kategori", 60), deskripsi: teks("deskripsi", 2000), foto_url: teks("foto_url", 500),
    bahan: teks("bahan", 200), finishing: teks("finishing", 200), warna: teks("warna", 80),
    garansi: teks("garansi", 200), perawatan: teks("perawatan", 500), waktu_pembuatan: teks("waktu_pembuatan", 80), badge: teks("badge", 20),
    penggunaan: teks("penggunaan", 20),
    aktif: fd.get("aktif") === "on", urutan: angka("urutan") ?? 0,
    harga: angka("harga"), stok: angka("stok"), harga_coret: angka("harga_coret"),
    panjang_cm: angka("panjang_cm"), lebar_cm: angka("lebar_cm"), tinggi_cm: angka("tinggi_cm"), berat_kg: angka("berat_kg"),
  };
  if (!d.nama) return { error: "Nama produk wajib diisi." };
  if (!Number.isInteger(d.harga) || d.harga < 0 || d.harga > 1_000_000_000) return { error: "Harga harus bilangan bulat antara 0 dan 1.000.000.000." };
  if (!Number.isInteger(d.stok) || d.stok < 0 || d.stok > 100000) return { error: "Stok harus bilangan bulat antara 0 dan 100.000." };
  if (d.harga_coret !== null && (!Number.isInteger(d.harga_coret) || d.harga_coret <= d.harga)) return { error: "Harga coret harus bilangan bulat dan lebih besar dari harga jual, atau kosongkan." };
  for (const [k, n] of [["panjang_cm", "Panjang"], ["lebar_cm", "Lebar"], ["tinggi_cm", "Tinggi"]]) {
    if (d[k] !== null && (!Number.isInteger(d[k]) || d[k] <= 0 || d[k] > 2000)) return { error: `${n} harus bilangan bulat dalam cm (1–2000), atau kosongkan.` };
  }
  if (d.berat_kg !== null && (!(d.berat_kg > 0) || d.berat_kg > 5000)) return { error: "Berat harus lebih dari 0 dan maksimal 5000 kg, atau kosongkan." };
  if (!Number.isInteger(d.urutan) || d.urutan < 0 || d.urutan > 9999) return { error: "Urutan tampil harus bilangan bulat 0–9999 (angka kecil tampil lebih dulu)." };
  if (d.penggunaan !== null && !PENGGUNAAN_SAH.includes(d.penggunaan)) return { error: "Pilihan indoor/outdoor tidak valid." };
  if (d.foto_url && !/^(https:\/\/|\/(?!\/))/.test(d.foto_url)) return { error: "Link foto harus diawali https:// atau / (contoh: /produk/kursi.svg)." };
  // US-18: foto tambahan, satu link per baris, maksimal 5.
  const tambahan = String(fd.get("foto_tambahan") || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (tambahan.length > 5) return { error: "Foto tambahan maksimal 5 link." };
  if (tambahan.some((u) => u.length > 500 || !/^(https:\/\/|\/(?!\/))/.test(u))) return { error: "Setiap link foto tambahan harus diawali https:// atau /." };
  d.foto_tambahan = tambahan;
  // US-48: varian harga, satu per baris "Nama | Harga", maksimal 8.
  const baris = String(fd.get("varian") || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (baris.length > 8) return { error: "Varian maksimal 8 baris." };
  d.varian = [];
  for (const b of baris) {
    const [nm, hg] = b.split("|").map((x) => x.trim());
    const h = Number((hg || "").replace(/[.\s]/g, ""));
    if (!nm || nm.length > 40 || !Number.isInteger(h) || h < 0 || h > 1_000_000_000) return { error: `Varian "${b.slice(0, 40)}" tidak valid. Format: Nama | Harga (contoh: 120 cm | 1650000).` };
    d.varian.push({ nama: nm, harga: h });
  }
  if (d.berat_kg !== null) d.berat_kg = Math.round(d.berat_kg * 10) / 10;
  return { d };
}

export async function simpanProduk(_, fd) {
  const sb = await wajibAdmin();
  const { d, error: salah } = bacaProduk(fd);
  if (salah) return { error: salah };
  const id = fd.get("id");
  if (id && !/^\d+$/.test(String(id))) return { error: "Produk tidak valid." };
  const { error } = id ? await sb.from("produk").update(d).eq("id", id) : await sb.from("produk").insert(d);
  if (error) return { error: "Gagal menyimpan produk." };
  await catat(sb, id ? "Ubah produk" : "Tambah produk", `${d.nama}${id ? ` (id ${id})` : ""}`);
  revalidatePath("/"); revalidatePath("/kategori", "layout");
  redirect("/admin");
}

// US-32: aktifkan atau nonaktifkan produk (produk nonaktif disembunyikan dari pengunjung).
export async function ubahAktif(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || "");
  if (!/^\d+$/.test(id)) return;
  const aktif = fd.get("aktif") === "true";
  await sb.from("produk").update({ aktif }).eq("id", id);
  await catat(sb, aktif ? "Aktifkan produk" : "Nonaktifkan produk", `id ${id}`);
  revalidatePath("/"); revalidatePath("/admin"); revalidatePath("/kategori", "layout");
}

export async function hapusProduk(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || "");
  if (!/^\d+$/.test(id)) return;
  await sb.from("produk").delete().eq("id", id);
  await catat(sb, "Hapus produk", `id ${id}`);
  revalidatePath("/"); revalidatePath("/kategori", "layout");
  revalidatePath("/admin");
}

export async function simpanRuangan(fd) {
  const sb = await wajibAdmin();
  const data = { nama: String(fd.get("nama") || "").trim(), jenis: fd.get("jenis"), foto_url: String(fd.get("foto_url") || "").trim() };
  if (!data.nama || !data.foto_url || !["indoor", "outdoor"].includes(data.jenis)) return;
  const id = fd.get("id");
  if (id) await sb.from("ruangan").update(data).eq("id", id); else await sb.from("ruangan").insert(data);
  revalidatePath("/"); revalidatePath("/admin/ruangan");
}

export async function hapusRuangan(fd) {
  const sb = await wajibAdmin();
  await sb.from("ruangan").delete().eq("id", fd.get("id"));
  revalidatePath("/"); revalidatePath("/admin/ruangan");
}

export async function tambahTanda(ruangan_id, produk_id, x, y) {
  const sb = await wajibAdmin();
  const [a, b, c, d] = [ruangan_id, produk_id, x, y].map(Number);
  if (![a, b, c, d].every(Number.isFinite) || c < 0 || c > 100 || d < 0 || d > 100) return;
  await sb.from("tanda").insert({ ruangan_id: a, produk_id: b, x: c, y: d });
  revalidatePath("/"); revalidatePath("/admin/ruangan");
}

export async function hapusTanda(fd) {
  const sb = await wajibAdmin();
  await sb.from("tanda").delete().eq("id", fd.get("id"));
  revalidatePath("/"); revalidatePath("/admin/ruangan");
}

// ---------- US-43: pengaturan toko ----------
export async function simpanPengaturan(_, fd) {
  const sb = await wajibAdmin();
  const t = (k, maks) => String(fd.get(k) || "").trim().slice(0, maks);
  const nomor = String(fd.get("nomor_whatsapp") || "").replace(/[\s\-+()]/g, "");
  if (!/^[1-9]\d{7,14}$/.test(nomor)) return { error: "Nomor WhatsApp harus berupa angka format internasional tanpa + dan tanpa 0 di depan (contoh: 6281234567890)." };
  const tautan = t("promo_tautan", 200);
  if (tautan && !/^(#|\/(?!\/)|https:\/\/)/.test(tautan)) return { error: "Tautan promo harus diawali #, / atau https://." };
  const baris = {
    id: 1, nama: t("nama", 80) || null, tagline: t("tagline", 160) || null, deskripsi: t("deskripsi", 500) || null,
    alamat: t("alamat", 200) || null, jam_buka: t("jam_buka", 80) || null, nomor_whatsapp: nomor,
    promo_teks: t("promo_teks", 160), promo_label: t("promo_label", 30), promo_tautan: tautan || "#katalog",
    diubah_pada: new Date().toISOString(),
  };
  const { error } = await sb.from("pengaturan_toko").upsert(baris);
  if (error) return { error: "Gagal menyimpan pengaturan. Pastikan SQL migrasi-bonus2 sudah dijalankan." };
  await catat(sb, "Ubah pengaturan toko");
  revalidatePath("/", "layout");
  return { ok: "Pengaturan tersimpan." };
}

// ---------- US-31: kelola kategori (ganti nama / gabung / kosongkan) ----------
export async function ubahKategori(fd) {
  const sb = await wajibAdmin();
  const lama = String(fd.get("lama") || "").trim().slice(0, 60);
  const baru = String(fd.get("baru") ?? "").trim().slice(0, 60);
  if (!lama) return;
  const { error } = await sb.from("produk").update({ kategori: baru || null }).eq("kategori", lama);
  if (!error) await catat(sb, "Ubah kategori", `${lama} → ${baru || "(kosong)"}`);
  revalidatePath("/", "layout"); revalidatePath("/admin/kategori");
}

// ---------- US-46: impor produk dari CSV ----------

export async function imporProduk(_, fd) {
  const sb = await wajibAdmin();
  const berkas = fd.get("berkas");
  if (!berkas || typeof berkas === "string" || berkas.size === 0) return { error: "Pilih berkas CSV lebih dulu." };
  if (berkas.size > 200_000) return { error: "Berkas terlalu besar (maksimal 200 KB)." };
  const baris = bacaCsv(await berkas.text());
  if (baris.length < 2) return { error: "CSV kosong. Baris pertama harus berisi nama kolom." };
  const kepala = baris[0].map((h) => h.trim().toLowerCase());
  if (!kepala.includes("nama") || !kepala.includes("harga")) return { error: "Kolom wajib: nama dan harga. Gunakan hasil Ekspor CSV sebagai contoh." };
  if (baris.length - 1 > 200) return { error: "Maksimal 200 produk per impor." };

  const lolos = [], gagal = [];
  baris.slice(1).forEach((r, i) => {
    const rec = Object.fromEntries(kepala.map((h, j) => [h, (r[j] ?? "").trim().replace(/^'(?=[=+\-@])/, "")]));
    const aktif = !/^(0|false|tidak|nonaktif|no)$/i.test(rec.aktif || "");
    const get = (k) => (k === "aktif" ? (aktif ? "on" : "") : k === "stok" && !rec.stok ? "10" : k === "foto_tambahan" ? "" : rec[k] ?? null);
    const { d, error } = bacaProduk({ get });
    if (error) gagal.push(`Baris ${i + 2}: ${error}`); else lolos.push(d);
  });
  if (lolos.length) {
    const { error } = await sb.from("produk").insert(lolos);
    if (error) return { error: "Gagal menyimpan ke database. Tidak ada produk yang diimpor." };
    await catat(sb, "Impor CSV", `${lolos.length} produk`);
    revalidatePath("/", "layout"); revalidatePath("/admin");
  }
  const ringkas = `${lolos.length} produk diimpor, ${gagal.length} baris dilewati.`;
  return gagal.length ? { error: `${ringkas} ${gagal.slice(0, 8).join(" ")}` } : { ok: ringkas };
}

// ---------- US-29: unggah foto ke Supabase Storage ----------
function jenisGambar(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { mime: "image/png", ext: "png" };
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export async function unggahFoto(fd) {
  const sb = await wajibAdmin();
  const f = fd.get("berkas");
  if (!f || typeof f === "string" || f.size === 0) return { error: "Pilih berkas gambar." };
  if (f.size > 4 * 1024 * 1024) return { error: "Ukuran foto maksimal 4 MB." };
  const buf = Buffer.from(await f.arrayBuffer());
  const jenis = jenisGambar(buf); // isi berkas diperiksa, bukan hanya nama atau tipe yang dikirim browser
  if (!jenis) return { error: "Format harus JPG, PNG, atau WebP." };
  const nama = `${Date.now()}-${globalThis.crypto.randomUUID().slice(0, 8)}.${jenis.ext}`;
  const db = dbServer();
  const { error } = await db.storage.from("produk-foto").upload(nama, buf, { contentType: jenis.mime, upsert: false });
  if (error) return { error: "Gagal mengunggah. Pastikan SQL migrasi-bonus3 sudah dijalankan (bucket produk-foto)." };
  await catat(sb, "Unggah foto", nama);
  return { url: db.storage.from("produk-foto").getPublicUrl(nama).data.publicUrl };
}

// ---------- US-39: moderasi ulasan ----------
export async function ubahUlasan(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || ""), status = String(fd.get("status") || "");
  if (!/^\d+$/.test(id) || !["tampil", "ditolak", "menunggu"].includes(status)) return;
  await sb.from("ulasan").update({ status }).eq("id", id);
  await catat(sb, `Ulasan ${status}`, `id ${id}`);
  revalidatePath("/admin/ulasan"); revalidatePath("/produk", "layout");
}

export async function hapusUlasan(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || "");
  if (!/^\d+$/.test(id)) return;
  await sb.from("ulasan").delete().eq("id", id);
  await catat(sb, "Hapus ulasan", `id ${id}`);
  revalidatePath("/admin/ulasan"); revalidatePath("/produk", "layout");
}

// ---------- US-44: kelola akun admin ----------
export async function tambahAdmin(_, fd) {
  const sb = await wajibAdmin();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return { error: "Email tidak valid." };
  if (password.length < 10) return { error: "Password minimal 10 karakter." };
  const { error } = await dbServer().auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return { error: "Gagal membuat akun. Email mungkin sudah terdaftar." };
  await catat(sb, "Tambah admin", email);
  revalidatePath("/admin/akun");
  return { ok: `Akun ${email} dibuat. Beri tahu password-nya lewat jalur aman.` };
}

export async function hapusAdmin(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const { data: { user } } = await sb.auth.getUser();
  if (user?.id === id) return; // tidak boleh menghapus akun sendiri
  const db = dbServer();
  const { data } = await db.auth.admin.listUsers({ perPage: 100 });
  if ((data?.users?.length ?? 0) < 2) return; // minimal satu admin harus tersisa
  const { error } = await db.auth.admin.deleteUser(id);
  if (!error) await catat(sb, "Hapus admin", id);
  revalidatePath("/admin/akun");
}

// US-14: buat deskripsi produk. Hanya admin login, dibatasi 10 permintaan/menit. Memakai Gemini bila GEMINI_API_KEY ada, bila tidak atau gagal, memakai templat. Hasil hanya mengisi kolom; admin tetap menyimpan sendiri.
export async function generateDeskripsiAI(f) {
  await wajibAdmin();
  const b = (v, n) => String(v ?? "").trim().slice(0, n) || null;
  const data = {
    nama: b(f?.nama, 120), kategori: b(f?.kategori, 60), penggunaan: b(f?.penggunaan, 20),
    bahan: b(f?.bahan, 200), finishing: b(f?.finishing, 200), warna: b(f?.warna, 80),
    panjang_cm: b(f?.panjang_cm, 8), lebar_cm: b(f?.lebar_cm, 8), tinggi_cm: b(f?.tinggi_cm, 8),
    waktu_pembuatan: b(f?.waktu_pembuatan, 80), garansi: b(f?.garansi, 200),
  };
  if (!data.nama) return { error: "Isi nama produk terlebih dahulu." };
  if (!(await batasi(`deskripsi:${await ipKlien()}`, 10, 60_000))) return { error: "Terlalu banyak permintaan. Coba lagi sebentar lagi." };
  const ai = await deskripsiAI(data);
  return { success: true, deskripsi: ai || buatDeskripsi(data), sumber: ai ? "ai" : "templat" };
}
