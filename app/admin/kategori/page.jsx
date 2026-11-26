import NavAdmin from "../../../components/NavAdmin";
import { dbSesi } from "../../../lib/supabase/sesi";
import { ubahKategori } from "../actions";

export const dynamic = "force-dynamic";

// US-31: ganti nama kategori untuk semua produknya. Nama yang sama dengan kategori lain berarti menggabungkan keduanya.
export default async function Kategori() {
  const sb = await dbSesi();
  const { data } = await sb.from("produk").select("kategori");
  const hitung = {};
  (data || []).forEach((p) => { const k = p.kategori || ""; hitung[k] = (hitung[k] || 0) + 1; });
  const daftar = Object.entries(hitung).filter(([k]) => k).sort((a, b) => a[0].localeCompare(b[0], "id"));
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Kategori</h1>
        <p className="mt-2 max-w-xl text-sm text-redam">Ganti nama akan mengubah semua produk di kategori itu. Mengisi dengan nama kategori lain menggabungkan keduanya. Mengosongkan nama membuat produknya tanpa kategori. Kategori baru dibuat lewat form produk.</p>
        <ul className="panel mt-5 divide-y divide-garis">
          {daftar.length === 0 && <li className="p-8 text-center text-redam">Belum ada kategori.</li>}
          {daftar.map(([k, n]) => (
            <li key={k} className="p-4">
              <form action={ubahKategori} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="lama" value={k} />
                <input name="baru" defaultValue={k} maxLength={60} aria-label={`Nama baru untuk ${k}`} className="input max-w-xs" />
                <span className="text-sm text-redam">{n} produk</span>
                <button className="btn-garis px-3 py-1.5">Simpan nama</button>
              </form>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
