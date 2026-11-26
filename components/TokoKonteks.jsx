"use client";
import { createContext, useContext, useMemo } from "react";

// Membawa pengaturan toko (dari database) ke komponen klien.
const Konteks = createContext(null);

export function TokoProvider({ toko, children }) {
  const nilai = useMemo(() => ({ toko, linkWA: (teks) => `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(teks)}` }), [toko]);
  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}
export const useTokoData = () => useContext(Konteks);
