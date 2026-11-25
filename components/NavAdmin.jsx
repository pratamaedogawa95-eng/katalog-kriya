import Link from "next/link";
import { keluar } from "../app/admin/actions";

export default function NavAdmin() {
  return (
    <header className="border-b border-garis bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 text-sm font-medium">
        <nav className="flex gap-5"><Link href="/admin" className="hover:text-brand">Produk</Link><Link href="/admin/ruangan" className="hover:text-brand">Ruangan &amp; tanda</Link><Link href="/admin/password" className="hover:text-brand">Ganti password</Link><Link href="/" className="text-redam hover:text-brand">Lihat toko</Link></nav>
        <form action={keluar}><button className="btn-garis px-3 py-1.5">Keluar</button></form>
      </div>
    </header>
  );
}
