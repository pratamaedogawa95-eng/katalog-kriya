import "./globals.css";
import { toko } from "../lib/toko";

export const metadata = {
  title: `${toko.nama} — ${toko.tagline}`,
  description: toko.deskripsi,
  openGraph: { title: toko.nama, description: toko.deskripsi, type: "website" },
};
export const dynamic = "force-dynamic"; // CSP bernonce butuh render per permintaan
export const viewport = { themeColor: "#92400e" };

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
