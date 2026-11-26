// Jadikan cookie login "cookie sesi": hilang saat browser ditutup, bukan bertahan berbulan-bulan.
// Cookie yang sedang dihapus (value kosong atau maxAge 0, mis. saat Keluar) dibiarkan agar tetap terhapus.
export function opsiSesi(options = {}, value = "") {
  if (!value || options.maxAge === 0) return options;
  const { maxAge, expires, ...sisa } = options;
  return sisa;
}
