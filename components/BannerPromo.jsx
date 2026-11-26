import { ambilToko } from "../lib/toko-server";

export default async function BannerPromo() {
  const { promo } = await ambilToko();
  if (!promo.teks) return null;
  return (
    <div className="bg-kuningan px-5 py-2.5 text-center text-sm font-medium text-teak">
      {promo.teks}{" "}
      {promo.label && <a href={promo.tautan} className="font-bold underline">{promo.label}</a>}
    </div>
  );
}
