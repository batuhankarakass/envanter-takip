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
import {
  DURUM_RENKLERI,
  cihazDurumEtiketi,
  cihazTipiEtiketi,
  zimmetHareketEtiketi,
} from "@/lib/sabitler";
import { bosDegilse, tarihYaz } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PersonelDetaySayfasi(
  props: PageProps<"/personel/[id]">,
) {
  const { id } = await props.params;
  const personelId = Number(id);
  if (!Number.isInteger(personelId)) notFound();

  const personel = await prisma.personel.findUnique({
    where: { id: personelId },
    include: {
      departman: true,
      lokasyon: true,
      cihazlar: { include: { lokasyon: true }, orderBy: { envanterKodu: "asc" } },
      lisansAtamalari: {
        include: { lisans: true, cihaz: true },
        orderBy: { atamaTarihi: "desc" },
      },
      zimmetHareketleri: {
        include: { cihaz: true },
        orderBy: { tarih: "desc" },
        take: 10,
      },
    },
  });

  if (!personel) notFound();

  return (
    <>
      <SayfaBasligi
        baslik={`${personel.ad} ${personel.soyad}`}
        aciklama={[personel.unvan, personel.departman?.ad]
          .filter(Boolean)
          .join(" · ")}
        eylem={<Buton href="/personel">Listeye dön</Buton>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Kart baslik={`Zimmetli cihazlar (${personel.cihazlar.length})`}>
            {personel.cihazlar.length === 0 ? (
              <BosDurum mesaj="Bu personele zimmetli cihaz yok." />
            ) : (
              <div className="tablo-sarmal">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-3 font-medium">Kod</th>
                      <th className="py-2 pr-3 font-medium">Cihaz</th>
                      <th className="py-2 pr-3 font-medium">Tür</th>
                      <th className="py-2 pr-3 font-medium">IP</th>
                      <th className="py-2 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personel.cihazlar.map((c) => (
                      <tr key={c.id} className="border-b border-line last:border-0">
                        <td className="py-2.5 pr-3">
                          <Link
                            href={`/cihazlar/${c.id}`}
                            className="font-medium text-brand"
                          >
                            {c.envanterKodu}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-3">
                          {c.marka} {c.model}
                        </td>
                        <td className="py-2.5 pr-3">
                          {cihazTipiEtiketi(c.tip)}
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs">
                          {bosDegilse(c.ipAdresi)}
                        </td>
                        <td className="py-2.5">
                          <Rozet renk={DURUM_RENKLERI[c.durum]}>
                            {cihazDurumEtiketi(c.durum)}
                          </Rozet>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Kart>

          <Kart baslik="Kullandığı lisanslar">
            {personel.lisansAtamalari.length === 0 ? (
              <BosDurum mesaj="Bu personele atanmış lisans yok." />
            ) : (
              <ul className="space-y-2">
                {personel.lisansAtamalari.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2 text-sm last:border-0"
                  >
                    <div>
                      <Link
                        href={`/lisanslar/${a.lisansId}`}
                        className="font-medium text-brand"
                      >
                        {a.lisans.urunAdi}
                      </Link>
                      <p className="text-xs text-muted">
                        {a.cihaz
                          ? `${a.cihaz.envanterKodu} üzerinde kurulu`
                          : "Cihaza bağlı değil"}
                      </p>
                    </div>
                    <span className="text-xs text-muted">
                      {tarihYaz(a.atamaTarihi)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Kart>

          <Kart baslik="Son zimmet hareketleri">
            {personel.zimmetHareketleri.length === 0 ? (
              <BosDurum mesaj="Hareket kaydı yok." />
            ) : (
              <ol className="space-y-3">
                {personel.zimmetHareketleri.map((h) => (
                  <li key={h.id} className="border-l-2 border-line pl-4 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {zimmetHareketEtiketi(h.tip)}
                      </span>
                      <Link
                        href={`/cihazlar/${h.cihazId}`}
                        className="text-brand"
                      >
                        {h.cihaz.envanterKodu}
                      </Link>
                      <span className="text-xs text-muted">
                        {tarihYaz(h.tarih)}
                      </span>
                    </div>
                    {h.aciklama ? (
                      <p className="mt-0.5 text-xs text-muted">{h.aciklama}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </Kart>
        </div>

        <Kart baslik="Personel bilgileri">
          <dl>
            <BilgiSatiri etiket="Sicil no">
              <span className="font-mono text-xs">{personel.sicilNo}</span>
            </BilgiSatiri>
            <BilgiSatiri etiket="Unvan">
              {bosDegilse(personel.unvan)}
            </BilgiSatiri>
            <BilgiSatiri etiket="Departman">
              {personel.departman?.ad ?? "—"}
            </BilgiSatiri>
            <BilgiSatiri etiket="Lokasyon">
              {personel.lokasyon?.ad ?? "—"}
            </BilgiSatiri>
            <BilgiSatiri etiket="E-posta">
              {bosDegilse(personel.eposta)}
            </BilgiSatiri>
            <BilgiSatiri etiket="Telefon">
              {bosDegilse(personel.telefon)}
            </BilgiSatiri>
            <BilgiSatiri etiket="İşe giriş">
              {tarihYaz(personel.iseGirisTarihi)}
            </BilgiSatiri>
            <BilgiSatiri etiket="Kayıt durumu">
              {personel.aktif ? "Aktif" : "Pasif"}
            </BilgiSatiri>
          </dl>
        </Kart>
      </div>
    </>
  );
}
