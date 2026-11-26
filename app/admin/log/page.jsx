import NavAdmin from "../../../components/NavAdmin";
import { dbSesi } from "../../../lib/supabase/sesi";

export const dynamic = "force-dynamic";

// US-45: 100 aktivitas admin terakhir.
export default async function Log() {
  const sb = await dbSesi();
  const { data, error } = await sb.from("log_admin").select("*").order("created_at", { ascending: false }).limit(100);
  const waktu = (t) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(t));
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Log aktivitas</h1>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">Log belum bisa dimuat. Pastikan SQL migrasi-bonus2 sudah dijalankan.</p>}
        <div className="panel mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-redam"><tr><th className="p-3 font-medium">Waktu (WIB)</th><th className="p-3 font-medium">Admin</th><th className="p-3 font-medium">Aksi</th><th className="p-3 font-medium">Detail</th></tr></thead>
            <tbody>
              {(data || []).length === 0 && <tr><td colSpan={4} className="p-8 text-center text-redam">Belum ada aktivitas tercatat.</td></tr>}
              {(data || []).map((l) => <tr key={l.id} className="border-t border-garis"><td className="p-3 whitespace-nowrap">{waktu(l.created_at)}</td><td className="p-3">{l.email || "–"}</td><td className="p-3 font-medium">{l.aksi}</td><td className="p-3 text-redam">{l.detail}</td></tr>)}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
