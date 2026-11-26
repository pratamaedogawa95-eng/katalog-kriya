import { cache } from "react";
import { toko as awal } from "./toko";
import { promo as promoAwal } from "./promo";
import { dbServer } from "./supabase/server";

// US-43: pengaturan toko dari database menimpa nilai awal di lib/toko.js dan lib/promo.js.
export const ambilToko = cache(async () => {
  const hasil = { ...awal, promo: { ...promoAwal } };
  try {
    const { data } = await dbServer().from("pengaturan_toko").select("*").eq("id", 1).maybeSingle();
    if (data) {
      const isi = (k, v) => { if (v && String(v).trim()) hasil[k] = String(v).trim(); };
      isi("nama", data.nama); isi("tagline", data.tagline); isi("deskripsi", data.deskripsi);
      isi("alamat", data.alamat); isi("jamBuka", data.jam_buka); isi("nomorWhatsApp", data.nomor_whatsapp);
      hasil.promo = { teks: data.promo_teks ?? "", label: data.promo_label ?? "", tautan: data.promo_tautan || "#katalog" };
    }
  } catch {}
  return hasil;
});
