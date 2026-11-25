"use client";
export default function GlobalError({ reset }) {
  return (
    <html lang="id"><body style={{ fontFamily: "system-ui", textAlign: "center", padding: "20vh 1.5rem" }}>
      <h1>Terjadi kesalahan</h1><p>Muat ulang halaman atau coba lagi nanti.</p>
      <button onClick={reset}>Coba lagi</button>
    </body></html>
  );
}
