"use client";
import { useState } from "react";
import Foto from "./Foto";
import { TombolHapus } from "./FormAdmin";
import { simpanRuangan, hapusRuangan, tambahTanda, hapusTanda } from "../app/admin/actions";

export default function EditorRuangan({ ruangan, produk }) {
  const [ruId, setRuId] = useState(ruangan[0]?.id);
  const [pid, setPid] = useState(produk[0]?.id);
  const [ubah, setUbah] = useState(false);
  const ru = ruangan.find((r) => r.id === ruId) || ruangan[0];
  const nama = (id) => produk.find((p) => p.id === id)?.nama || "Produk";

  const tandai = async (e) => {
    if (!ru || !pid) return;
    const r = e.currentTarget.getBoundingClientRect();
    await tambahTanda(ru.id, pid, ((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <div className="flex flex-wrap gap-3">
          <select value={ru?.id ?? ""} onChange={(e) => setRuId(Number(e.target.value))} aria-label="Pilih ruangan" className="input w-56">{ruangan.map((r) => <option key={r.id} value={r.id}>{r.nama} ({r.jenis})</option>)}</select>
          <select value={pid ?? ""} onChange={(e) => setPid(Number(e.target.value))} aria-label="Produk yang ditandai" className="input w-64">{produk.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}</select>
        </div>
        {ru ? (
          <>
            <p className="mt-3 text-sm text-redam">Pilih produk, lalu <b>klik di foto</b> tepat pada furnitur untuk memasang tanda (+). Untuk memindah, hapus tandanya lalu pasang lagi.</p>
            <div onClick={tandai} className="relative mt-3 aspect-[8/5] cursor-crosshair overflow-hidden rounded-xl border border-garis">
              <Foto src={ru.foto_url} alt={ru.nama} className="size-full" />
              {ru.tanda?.map((t) => <span key={t.id} style={{ left: `${t.x}%`, top: `${t.y}%` }} className="absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-brand font-bold text-white shadow">+</span>)}
            </div>
            <h3 className="mt-6 font-semibold">Produk yang ditandai</h3>
            <ul className="panel mt-2 divide-y divide-garis">
              {!ru.tanda?.length && <li className="p-4 text-sm text-redam">Belum ada tanda. Pilih produk lalu klik foto.</li>}
              {ru.tanda?.map((t) => <li key={t.id} className="flex items-center justify-between p-3 text-sm"><span>{nama(t.produk_id)}</span><TombolHapus aksi={hapusTanda} id={t.id} nama={`tanda ${nama(t.produk_id)}`} /></li>)}
            </ul>
          </>
        ) : <p className="panel mt-4 p-8 text-center text-redam">Belum ada ruangan. Tambahkan lewat formulir di samping.</p>}
      </div>
      <div className="flex flex-col gap-4">
        <form key={`${ubah}-${ru?.id}`} action={simpanRuangan} className="panel flex flex-col gap-3 p-5">
          <h3 className="font-display text-lg font-bold">{ubah ? "Ubah ruangan ini" : "Ruangan baru"}</h3>
          {ubah && <input type="hidden" name="id" value={ru.id} />}
          <div><label htmlFor="rn" className="label">Nama</label><input id="rn" name="nama" required className="input" defaultValue={ubah ? ru.nama : ""} /></div>
          <div><label htmlFor="rj" className="label">Jenis</label><select id="rj" name="jenis" className="input" defaultValue={ubah ? ru.jenis : "indoor"}><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></select></div>
          <div><label htmlFor="rf" className="label">Link foto</label><input id="rf" name="foto_url" required className="input" defaultValue={ubah ? ru.foto_url : ""} placeholder="https://…" /></div>
          <button className="btn-brand">Simpan ruangan</button>
        </form>
        {ru && (
          <div className="flex gap-2">
            <button onClick={() => setUbah(!ubah)} className="btn-garis flex-1">{ubah ? "Batal ubah" : "Ubah ruangan ini"}</button>
            <TombolHapus aksi={hapusRuangan} id={ru.id} nama={ru.nama} />
          </div>
        )}
      </div>
    </div>
  );
}
