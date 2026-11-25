import Link from "next/link";
import { toko } from "../lib/toko";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-garis bg-kertas/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-teak font-display text-sm font-bold text-kuningan">K&amp;K</span>
          <span className="font-display text-lg font-bold">{toko.nama}</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-redam">
          <a href="/#display" className="hidden hover:text-tinta sm:block">Display</a>
          <a href="/#simulasi" className="hidden hover:text-tinta sm:block">Simulasi</a>
          <a href="/#katalog" className="hover:text-tinta">Katalog</a>
          <a href="/#tentang" className="hidden hover:text-tinta sm:block">Tentang</a>
          <a href="/#kontak" className="hover:text-tinta">Kontak</a>
        </nav>
      </div>
    </header>
  );
}
