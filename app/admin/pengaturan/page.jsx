import NavAdmin from "../../../components/NavAdmin";
import { FormPengaturan } from "../../../components/FormAdmin";
import { dbSesi } from "../../../lib/supabase/sesi";
import { ambilToko } from "../../../lib/toko-server";

export const dynamic = "force-dynamic";

export default async function Pengaturan() {
  const sb = await dbSesi();
  const { data } = await sb.from("pengaturan_toko").select("*").eq("id", 1).maybeSingle();
  const t = await ambilToko(); // nilai efektif (database atau bawaan) sebagai isian awal
  const awal = data ?? { nama: t.nama, tagline: t.tagline, deskripsi: t.deskripsi, alamat: t.alamat, jam_buka: t.jamBuka, nomor_whatsapp: t.nomorWhatsApp, promo_teks: t.promo.teks, promo_label: t.promo.label, promo_tautan: t.promo.tautan };
  return <><NavAdmin /><main className="mx-auto flex max-w-5xl justify-center px-5 py-12"><FormPengaturan awal={awal} /></main></>;
}
