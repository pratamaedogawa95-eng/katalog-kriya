import Link from "next/link";
import { keluar } from "../app/admin/actions";

export default function NavAdmin() {
  return (
    <header className="border-b border-garis bg-white">
      <div className="mx-auto flex min-h-14 max-w-5xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-2 text-sm font-medium">
        <nav className="flex flex-wrap gap-x-5 gap-y-1"><Link href="/admin" className="hover:text-brand">Produk</Link><Link href="/admin/kategori" className="hover:text-brand">Kategori</Link><Link href="/admin/ruangan" className="hover:text-brand">Ruangan &amp; tanda</Link><Link href="/admin/pengaturan" className="hover:text-brand">Pengaturan</Link><Link href="/admin/log" className="hover:text-brand">Log</Link><Link href="/admin/password" className="hover:text-brand">Ganti password</Link><Link href="/" className="text-redam hover:text-brand">Lihat toko</Link></nav>
        <form action={keluar}><button className="btn-garis px-3 py-1.5">Keluar</button></form>
      </div>
    </header>
  );
}
