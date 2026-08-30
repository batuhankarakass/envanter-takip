import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BosDurum, Buton, Rozet, SayfaBasligi } from "@/components/arayuz";
import { lisansTipiEtiketi } from "@/lib/sabitler";
import { kalanGun, paraYaz, tarihYaz } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LisanslarSayfasi() {
  const lisanslar = await prisma.lisans.findMany({
    include: { _count: { select: { atamalar: true } } },
    orderBy: { urunAdi: "asc" },
  });

  const toplamBedel = lisanslar.reduce(
    (acc, l) => acc + (l.satinAlmaBedeli ?? 0),
    0,
  );

  return (
    <>
      <SayfaBasligi
        baslik="Lisanslar"
        aciklama={`${lisanslar.length} lisans kaydı · toplam ${paraYaz(toplamBedel)} tutarında`}
        eylem={<Buton href="/api/disa-aktar/lisanslar">CSV indir</Buton>}
      />

      <div className="tablo-sarmal rounded-xl border border-line bg-surface">
        {lisanslar.length === 0 ? (
          <BosDurum mesaj="Kayıtlı lisans yok." />
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Ürün</th>
                <th className="px-4 py-3 font-medium">Üretici</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">Kullanım</th>
                <th className="px-4 py-3 font-medium">Bitiş</th>
                <th className="px-4 py-3 font-medium">Bedel</th>
              </tr>
            </thead>
            <tbody>
              {lisanslar.map((l) => {
                const kullanim = l._count.atamalar;
                const asim = kullanim > l.toplamKoltuk;
                const gun = kalanGun(l.bitisTarihi);
                return (
                  <tr
                    key={l.id}
                    className="border-b border-line last:border-0 hover:bg-background"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/lisanslar/${l.id}`}
                        className="font-medium text-brand"
                      >
                        {l.urunAdi}
                      </Link>
                      {l.surum ? (
                        <p className="text-xs text-muted">Sürüm {l.surum}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{l.uretici}</td>
                    <td className="px-4 py-3">{lisansTipiEtiketi(l.tip)}</td>
                    <td className="px-4 py-3">
                      <span className="tabular-nums">
                        {kullanim} / {l.toplamKoltuk}
                      </span>
                      {asim ? (
                        <span className="ml-2">
                          <Rozet renk="bg-rose-50 text-rose-700 ring-rose-600/20">
                            Aşım
                          </Rozet>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      {tarihYaz(l.bitisTarihi)}
                      {gun !== null && gun >= 0 && gun <= 60 ? (
                        <span className="ml-2 text-xs text-amber-600">
                          {gun} gün
                        </span>
                      ) : null}
                      {gun !== null && gun < 0 ? (
                        <span className="ml-2 text-xs text-rose-600">
                          doldu
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {paraYaz(l.satinAlmaBedeli, l.paraBirimi ?? "TRY")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
