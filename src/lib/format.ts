const tarihBicimi = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const paraBicimi = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export function tarihYaz(deger: Date | string | null | undefined) {
  if (!deger) return "—";
  const tarih = deger instanceof Date ? deger : new Date(deger);
  if (Number.isNaN(tarih.getTime())) return "—";
  return tarihBicimi.format(tarih);
}

export function paraYaz(deger: number | null | undefined, paraBirimi = "TRY") {
  if (deger === null || deger === undefined) return "—";
  if (paraBirimi === "TRY") return paraBicimi.format(deger);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: paraBirimi,
  }).format(deger);
}

/// Bugunden itibaren kalan gun sayisi. Gecmis tarihlerde negatif doner.
export function kalanGun(tarih: Date | string | null | undefined) {
  if (!tarih) return null;
  const hedef = tarih instanceof Date ? tarih : new Date(tarih);
  if (Number.isNaN(hedef.getTime())) return null;
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const h = new Date(hedef);
  h.setHours(0, 0, 0, 0);
  return Math.round((h.getTime() - bugun.getTime()) / 86_400_000);
}

export function bosDegilse(deger: string | null | undefined) {
  return deger && deger.trim().length > 0 ? deger : "—";
}
