import NavAdmin from "../../../components/NavAdmin";
import { FormAkun, TombolHapus } from "../../../components/FormAdmin";
import { dbSesi } from "../../../lib/supabase/sesi";
import { dbServer } from "../../../lib/supabase/server";
import { hapusAdmin } from "../actions";

export const dynamic = "force-dynamic";

// US-44: semua akun terdaftar di Supabase Auth dianggap admin. Matikan pendaftaran publik di Supabase (Authentication → Sign In / Providers).
export default async function Akun() {
  const { data: { user } } = await (await dbSesi()).auth.getUser();
  const { data } = await dbServer().auth.admin.listUsers({ perPage: 100 });
  const daftar = data?.users || [];
  const tgl = (t) => (t ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(t)) : "belum pernah");
  return (
    <>
      <NavAdmin />
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-2xl font-bold">Akun admin</h1>
        <p className="mt-2 max-w-xl text-sm text-redam">Setiap akun di sini bisa mengelola seluruh toko. Akun yang sedang kamu pakai dan admin terakhir tidak bisa dihapus.</p>
        <ul className="panel mt-5 divide-y divide-garis">
          {daftar.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1"><p className="truncate font-medium">{u.email}{u.id === user?.id && <span className="ml-2 rounded bg-stone-200 px-1.5 py-0.5 text-xs font-bold text-redam">Kamu</span>}</p><p className="text-sm text-redam">Login terakhir: {tgl(u.last_sign_in_at)}</p></div>
              {u.id !== user?.id && daftar.length > 1 && <TombolHapus aksi={hapusAdmin} id={u.id} nama={u.email} />}
            </li>
          ))}
        </ul>
        <FormAkun />
      </main>
    </>
  );
}
