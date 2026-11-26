import NavAdmin from "../../../../components/NavAdmin";
import { FormProduk } from "../../../../components/FormAdmin";
import { dbSesi } from "../../../../lib/supabase/sesi";

export const dynamic = "force-dynamic";

export default async function Baru() {
  const { data } = await (await dbSesi()).from("produk").select("kategori");
  const kategoriAda = [...new Set((data || []).map((p) => p.kategori).filter(Boolean))];
  return <><NavAdmin /><main className="mx-auto flex max-w-5xl justify-center px-5 py-12"><FormProduk kategoriAda={kategoriAda} /></main></>;
}
