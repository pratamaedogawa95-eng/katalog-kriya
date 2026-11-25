"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dbSesi } from "../../lib/supabase/sesi";
import { batasi, lepas, ipKlien } from "../../lib/batas";

async function wajibAdmin() {
  const sb = await dbSesi();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/admin/login");
  if (!batasi(`aksi:${user.id}`, 60, 60_000)) throw new Error("Terlalu banyak permintaan.");
  return sb;
}

export async function masuk(_, fd) {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const kIp = `login-ip:${await ipKlien()}`, kEmail = `login-email:${email}`;
  if (!batasi(kIp, 10, 15 * 60_000) || !batasi(kEmail, 5, 15 * 60_000))
    return { error: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit." };
  const sb = await dbSesi();
  const { error } = await sb.auth.signInWithPassword({
    email,
    password: String(fd.get("password") || ""),
  });
  if (error) return { error: "Email atau password salah." };
  lepas(kEmail);
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
  if (d.penggunaan !== null && !PENGGUNAAN_SAH.includes(d.penggunaan)) return { error: "Pilihan indoor/outdoor tidak valid." };
  if (d.foto_url && !/^(https:\/\/|\/(?!\/))/.test(d.foto_url)) return { error: "Link foto harus diawali https:// atau / (contoh: /produk/kursi.svg)." };
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
  revalidatePath("/"); revalidatePath("/kategori", "layout");
  redirect("/admin");
}

export async function hapusProduk(fd) {
  const sb = await wajibAdmin();
  const id = String(fd.get("id") || "");
  if (!/^\d+$/.test(id)) return;
  await sb.from("produk").delete().eq("id", id);
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
