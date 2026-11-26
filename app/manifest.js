import { ambilToko } from "../lib/toko-server";

export default async function manifest() {
  const toko = await ambilToko();
  return {
    name: toko.nama,
    short_name: toko.nama,
    description: toko.deskripsi,
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f4",
    theme_color: "#92400e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
