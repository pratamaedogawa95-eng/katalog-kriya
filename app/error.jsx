"use client";
export default function Error({ reset }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-3xl font-bold">Terjadi kesalahan</h1>
      <p className="text-redam">Halaman tidak bisa dimuat saat ini. Coba lagi, atau kembali beberapa saat lagi.</p>
      <button onClick={reset} className="btn-brand">Coba lagi</button>
    </main>
  );
}
