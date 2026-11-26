import "./globals.css";
import { ambilToko } from "../lib/toko-server";
import { TokoProvider } from "../components/TokoKonteks";
import { headers } from "next/headers";
import RegistrasiSW from "../components/RegistrasiSW";

export async function generateMetadata() {
  const toko = await ambilToko();
  return {
    title: `${toko.nama} — ${toko.tagline}`,
    description: toko.deskripsi,
    openGraph: { title: toko.nama, description: toko.deskripsi, type: "website" },
  };
}
export const dynamic = "force-dynamic"; // CSP bernonce butuh render per permintaan
export const viewport = { themeColor: "#92400e" };

// Skrip kecil sebelum render: pasang mode gelap lebih awal agar tidak berkedip. Memakai nonce dari proxy.js (CSP).
const SKRIP_TEMA = 'try{var t=localStorage.getItem("tema");if(t==="gelap"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}';

export default async function RootLayout({ children }) {
  const nonce = (await headers()).get("x-nonce") || undefined;
  const toko = await ambilToko();
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script nonce={nonce} suppressHydrationWarning>{SKRIP_TEMA}</script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body><TokoProvider toko={toko}>{children}</TokoProvider><RegistrasiSW /></body>
    </html>
  );
}
