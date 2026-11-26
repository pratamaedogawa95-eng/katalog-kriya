import { notFound } from "next/navigation";
import NavAdmin from "../../../../../components/NavAdmin";
import { FormProduk } from "../../../../../components/FormAdmin";
import { dbSesi } from "../../../../../lib/supabase/sesi";

export const dynamic = "force-dynamic";

export default async function Ubah({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const { data } = await (await dbSesi()).from("produk").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const { data: semua } = await (await dbSesi()).from("produk").select("kategori");
  const kategoriAda = [...new Set((semua || []).map((p) => p.kategori).filter(Boolean))];
  return <><NavAdmin /><main className="mx-auto flex max-w-5xl justify-center px-5 py-12"><FormProduk awal={data} kategoriAda={kategoriAda} /></main></>;
}
