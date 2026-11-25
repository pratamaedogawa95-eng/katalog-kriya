import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-redam">Produk atau halaman yang kamu cari tidak ada atau sudah dihapus.</p>
      <Link href="/" className="btn-brand">Kembali ke katalog</Link>
    </main>
  );
}
