// Pembaca CSV sederhana (kutip ganda, koma, baris baru di dalam kutipan). Cukup untuk impor produk.
export function bacaCsv(teks) {
  const t = String(teks).replace(/^﻿/, "");
  const baris = []; let sel = "", rec = [], kutip = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (kutip) {
      if (c === '"') { if (t[i + 1] === '"') { sel += '"'; i++; } else kutip = false; } else sel += c;
    } else if (c === '"') kutip = true;
    else if (c === ",") { rec.push(sel); sel = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; rec.push(sel); sel = ""; if (rec.some((x) => x !== "")) baris.push(rec); rec = []; }
    else sel += c;
  }
  rec.push(sel); if (rec.some((x) => x !== "")) baris.push(rec);
  return baris;
}
