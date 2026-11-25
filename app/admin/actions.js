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

export async function simpanProduk(_, fd) {
  const sb = await wajibAdmin();
  const teks = (k) => String(fd.get(k) || "").trim() || null;
  const data = { nama: teks("nama"), harga: Number(fd.get("harga")), kategori: teks("kategori"), foto_url: teks("foto_url"), deskripsi: teks("deskripsi"), stok: Number(fd.get("stok")) };
  if (!data.nama) return { error: "Nama produk wajib diisi." };
  if (!Number.isInteger(data.harga) || data.harga < 0) return { error: "Harga harus bilangan bulat, minimal 0." };
  if (!Number.isInteger(data.stok) || data.stok < 0) return { error: "Stok harus bilangan bulat, minimal 0." };
  const id = fd.get("id");
  const { error } = id ? await sb.from("produk").update(data).eq("id", id) : await sb.from("produk").insert(data);
  if (error) return { error: "Gagal menyimpan produk." };
  revalidatePath("/");
  redirect("/admin");
}

export async function hapusProduk(fd) {
  const sb = await wajibAdmin();
  await sb.from("produk").delete().eq("id", fd.get("id"));
  revalidatePath("/");
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
