import NavAdmin from "../../../components/NavAdmin";
import EditorRuangan from "../../../components/EditorRuangan";
import { dbSesi } from "../../../lib/supabase/sesi";

export const dynamic = "force-dynamic";

export default async function Ruangan() {
  const sb = await dbSesi();
  const { data: ruangan } = await sb.from("ruangan").select("*, tanda(id, produk_id, x, y)").order("id");
  const { data: produk } = await sb.from("produk").select("id, nama").order("nama");
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="mb-6 font-display text-2xl font-bold">Ruangan &amp; tanda (+)</h1>
        <EditorRuangan ruangan={ruangan || []} produk={produk || []} />
      </main>
    </>
  );
}
