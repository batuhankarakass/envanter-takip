import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  BilgiSatiri,
  BosDurum,
  Buton,
  Kart,
  Rozet,
  SayfaBasligi,
} from "@/components/arayuz";
import { lisansTipiEtiketi } from "@/lib/sabitler";
import { bosDegilse, kalanGun, paraYaz, tarihYaz } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function LisansDetaySayfasi(
  props: PageProps<"/lisanslar/[id]">,
) {
  const { id } = await props.params;
  const lisansId = Number(id);
  if (!Number.isInteger(lisansId)) notFound();

  const lisans = await prisma.lisans.findUnique({
    where: { id: lisansId },
    include: {
      atamalar: {
        include: { cihaz: true, personel: true },
        orderBy: { atamaTarihi: "desc" },
      },
    },
  });

  if (!lisans) notFound();

  const kullanim = lisans.atamalar.length;
  const kalanKoltuk = lisans.toplamKoltuk - kullanim;
  const gun = kalanGun(lisans.bitisTarihi);

  return (
    <>
      <SayfaBasligi
        baslik={lisans.urunAdi}
        aciklama={`${lisans.uretici}${lisans.surum ? ` · Sürüm ${lisans.surum}` : ""}`}
        eylem={<Buton href="/lisanslar">Listeye dön</Buton>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Kart baslik={`Atamalar (${kullanim})`}>
            {lisans.atamalar.length === 0 ? (
              <BosDurum mesaj="Bu lisans henüz hiçbir cihaza atanmamış." />
            ) : (
              <div className="tablo-sarmal">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-3 font-medium">Cihaz</th>
                      <th className="py-2 pr-3 font-medium">Personel</th>
                      <th className="py-2 pr-3 font-medium">Atama tarihi</th>
                      <th className="py-2 font-medium">Açıklama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lisans.atamalar.map((a) => (
                      <tr
                        key={a.id}
                        className="border-b border-line last:border-0"
                      >
                        <td className="py-2.5 pr-3">
                          {a.cihaz ? (
                            <Link
                              href={`/cihazlar/${a.cihaz.id}`}
                              className="font-medium text-brand"
                            >
                              {a.cihaz.envanterKodu}
                            </Link>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3">
                          {a.personel ? (
                            <Link
                              href={`/personel/${a.personel.id}`}
                              className="hover:text-brand"
                            >
                              {a.personel.ad} {a.personel.soyad}
                            </Link>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-3 text-muted">
                          {tarihYaz(a.atamaTarihi)}
                        </td>
                        <td className="py-2.5 text-xs text-muted">
                          {bosDegilse(a.aciklama)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Kart>
        </div>

        <Kart
          baslik="Lisans bilgileri"
          ustBilgi={
            kalanKoltuk < 0 ? (
              <Rozet renk="bg-rose-50 text-rose-700 ring-rose-600/20">
                Koltuk aşımı
              </Rozet>
            ) : null
          }
        >
          <dl>
            <BilgiSatiri etiket="Tür">
              {lisansTipiEtiketi(lisans.tip)}
            </BilgiSatiri>
            <BilgiSatiri etiket="Toplam koltuk">
              {lisans.toplamKoltuk}
            </BilgiSatiri>
            <BilgiSatiri etiket="Kullanılan">{kullanim}</BilgiSatiri>
            <BilgiSatiri etiket="Boşta">
              <span className={kalanKoltuk < 0 ? "text-rose-600" : undefined}>
                {kalanKoltuk}
              </span>
            </BilgiSatiri>
            <BilgiSatiri etiket="Başlangıç">
              {tarihYaz(lisans.baslangicTarihi)}
            </BilgiSatiri>
            <BilgiSatiri etiket="Bitiş">
              {tarihYaz(lisans.bitisTarihi)}
              {gun !== null ? (
                <span
                  className={`ml-2 text-xs ${gun < 0 ? "text-rose-600" : "text-muted"}`}
                >
                  {gun < 0 ? "süresi doldu" : `${gun} gün kaldı`}
                </span>
              ) : null}
            </BilgiSatiri>
            <BilgiSatiri etiket="Bedel">
              {paraYaz(lisans.satinAlmaBedeli, lisans.paraBirimi ?? "TRY")}
            </BilgiSatiri>
            <BilgiSatiri etiket="Lisans anahtarı">
              <span className="font-mono text-xs">
                {bosDegilse(lisans.lisansAnahtari)}
              </span>
            </BilgiSatiri>
          </dl>
          {lisans.notlar ? (
            <p className="mt-3 text-xs text-muted">{lisans.notlar}</p>
          ) : null}
        </Kart>
      </div>
    </>
  );
}
