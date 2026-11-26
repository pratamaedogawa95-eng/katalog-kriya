import NavAdmin from "../../../components/NavAdmin";
import { dbSesi } from "../../../lib/supabase/sesi";
import { ubahUlasan, hapusUlasan } from "../actions";
import { TombolHapus } from "../../../components/FormAdmin";

export const dynamic = "force-dynamic";

// US-39: moderasi ulasan. Ulasan baru berstatus "menunggu" dan baru tampil di toko setelah disetujui.
export default async function Ulasan() {
  const sb = await dbSesi();
  const { data, error } = await sb.from("ulasan").select("*, produk(nama)").order("created_at", { ascending: false }).limit(100);
  const urut = { menunggu: 0, tampil: 1, ditolak: 2 };
  const l = [...(data || [])].sort((a, b) => urut[a.status] - urut[b.status]);
  const label = { menunggu: "Menunggu", tampil: "Tampil", ditolak: "Ditolak" };
  const Aksi = ({ id, status, teks }) => <form action={ubahUlasan}><input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={status} /><button className="btn-garis px-3 py-1.5">{teks}</button></form>;
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Ulasan</h1>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Ulasan belum bisa dimuat. Pastikan SQL migrasi-bonus3 sudah dijalankan.</p>}
        <ul className="panel mt-5 divide-y divide-garis">
          {l.length === 0 && !error && <li className="p-8 text-center text-redam">Belum ada ulasan.</li>}
          {l.map((u) => (
            <li key={u.id} className="flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm"><b>{u.nama}</b> · <span className="text-brand">{"★".repeat(u.rating)}</span> · {u.produk?.nama} <span className={`ml-2 rounded px-1.5 py-0.5 text-xs font-bold ${u.status === "menunggu" ? "bg-amber-100 text-amber-900" : u.status === "tampil" ? "bg-green-100 text-green-800" : "bg-stone-200 text-redam"}`}>{label[u.status]}</span></p>
                <p className="mt-1 whitespace-pre-line text-sm text-redam">{u.isi}</p>
              </div>
              <div className="flex gap-2">
                {u.status !== "tampil" && <Aksi id={u.id} status="tampil" teks="Setujui" />}
                {u.status !== "ditolak" && <Aksi id={u.id} status="ditolak" teks="Tolak" />}
                <TombolHapus aksi={hapusUlasan} id={u.id} nama="ulasan ini" />
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
