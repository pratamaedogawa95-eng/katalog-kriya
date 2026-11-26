// US-45: catat aktivitas admin. Email diisi otomatis oleh database dari token login. Kegagalan log tidak boleh menggagalkan aksi.
export async function catat(sb, aksi, detail = null) {
  try { await sb.from("log_admin").insert({ aksi, detail: detail ? String(detail).slice(0, 300) : null }); } catch {}
}
