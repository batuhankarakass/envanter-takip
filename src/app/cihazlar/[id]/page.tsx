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
  CIHAZ_DURUM_LISTESI,
  DURUM_RENKLERI,
  cihazDurumEtiketi,
  cihazTipiEtiketi,
  lisansTipiEtiketi,
  zimmetHareketEtiketi,
} from "@/lib/sabitler";
import { bosDegilse, kalanGun, tarihYaz } from "@/lib/format";
import { durumGuncelle, zimmetIadeAl, zimmetVer } from "../eylemler";

export const dynamic = "force-dynamic";

export default async function CihazDetaySayfasi(
  props: PageProps<"/cihazlar/[id]">,
) {
  const { id } = await props.params;
  const cihazId = Number(id);
  if (!Number.isInteger(cihazId)) notFound();

  const cihaz = await prisma.cihaz.findUnique({
    where: { id: cihazId },
    include: {
      lokasyon: true,
      departman: true,
      zimmetliPersonel: { include: { departman: true } },
      lisansAtamalari: {
        include: { lisans: true },
        orderBy: { atamaTarihi: "desc" },
      },
      zimmetHareketleri: {
        include: { personel: true },
        orderBy: { tarih: "desc" },
      },
    },
  });

  if (!cihaz) notFound();

  const personeller = await prisma.personel.findMany({
    where: { aktif: true },
    orderBy: [{ ad: "asc" }, { soyad: "asc" }],
    include: { departman: true },
  });

  const garantiGun = kalanGun(cihaz.garantiBitis);
  const bakimGun = kalanGun(cihaz.sonrakiBakim);

  return (
    <>
      <SayfaBasligi
        baslik={cihaz.envanterKodu}
        aciklama={`${cihaz.marka} ${cihaz.model} · ${cihazTipiEtiketi(cihaz.tip)}`}
        eylem={<Buton href="/cihazlar">Listeye dön</Buton>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Kart
            baslik="Cihaz bilgileri"
            ustBilgi={
              <Rozet renk={DURUM_RENKLERI[cihaz.durum]}>
                {cihazDurumEtiketi(cihaz.durum)}
              </Rozet>
            }
          >
            <dl>
              <BilgiSatiri etiket="Envanter kodu">
                {cihaz.envanterKodu}
              </BilgiSatiri>
              <BilgiSatiri etiket="Tür">
                {cihazTipiEtiketi(cihaz.tip)}
              </BilgiSatiri>
              <BilgiSatiri etiket="Marka / Model">
                {cihaz.marka} {cihaz.model}
              </BilgiSatiri>
              <BilgiSatiri etiket="Seri numarası">
                <span className="font-mono text-xs">
                  {bosDegilse(cihaz.seriNo)}
                </span>
              </BilgiSatiri>
              <BilgiSatiri etiket="IP adresi">
                <span className="font-mono text-xs">
                  {bosDegilse(cihaz.ipAdresi)}
                </span>
              </BilgiSatiri>
              <BilgiSatiri etiket="MAC adresi">
                <span className="font-mono text-xs">
                  {bosDegilse(cihaz.macAdresi)}
                </span>
              </BilgiSatiri>
              <BilgiSatiri etiket="Lokasyon">
                {cihaz.lokasyon?.ad ?? "—"}
              </BilgiSatiri>
              <BilgiSatiri etiket="Departman">
                {cihaz.departman?.ad ?? "—"}
              </BilgiSatiri>
              <BilgiSatiri etiket="Alım tarihi">
                {tarihYaz(cihaz.alimTarihi)}
              </BilgiSatiri>
              <BilgiSatiri etiket="Garanti bitişi">
                {tarihYaz(cihaz.garantiBitis)}
                {garantiGun !== null ? (
                  <span
                    className={`ml-2 text-xs ${garantiGun < 0 ? "text-rose-600" : "text-muted"}`}
                  >
                    {garantiGun < 0
                      ? "süresi doldu"
                      : `${garantiGun} gün kaldı`}
                  </span>
                ) : null}
              </BilgiSatiri>
              <BilgiSatiri etiket="Son bakım">
                {tarihYaz(cihaz.sonBakimTarihi)}
              </BilgiSatiri>
              <BilgiSatiri etiket="Sonraki bakım">
                {tarihYaz(cihaz.sonrakiBakim)}
                {bakimGun !== null ? (
                  <span
                    className={`ml-2 text-xs ${bakimGun < 0 ? "text-amber-600" : "text-muted"}`}
                  >
                    {bakimGun < 0 ? "gecikmiş" : `${bakimGun} gün kaldı`}
                  </span>
                ) : null}
              </BilgiSatiri>
              {cihaz.notlar ? (
                <BilgiSatiri etiket="Notlar">{cihaz.notlar}</BilgiSatiri>
              ) : null}
            </dl>
          </Kart>

          <Kart baslik="Kurulu lisanslar">
            {cihaz.lisansAtamalari.length === 0 ? (
              <BosDurum mesaj="Bu cihaza atanmış lisans yok." />
            ) : (
              <ul className="space-y-2">
                {cihaz.lisansAtamalari.map((a) => (
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
                        {a.lisans.uretici} · {lisansTipiEtiketi(a.lisans.tip)}
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

          <Kart baslik="Zimmet geçmişi">
            {cihaz.zimmetHareketleri.length === 0 ? (
              <BosDurum mesaj="Henüz hareket kaydı yok." />
            ) : (
              <ol className="space-y-3">
                {cihaz.zimmetHareketleri.map((h) => (
                  <li
                    key={h.id}
                    className="border-l-2 border-line pl-4 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {zimmetHareketEtiketi(h.tip)}
                      </span>
                      {h.personel ? (
                        <Link
                          href={`/personel/${h.personel.id}`}
                          className="text-brand"
                        >
                          {h.personel.ad} {h.personel.soyad}
                        </Link>
                      ) : null}
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

        <div className="space-y-4">
          <Kart baslik="Zimmet durumu">
            {cihaz.zimmetliPersonel ? (
              <div className="mb-4 rounded-lg bg-brand-soft p-3">
                <p className="text-xs text-muted">Şu an zimmetli</p>
                <Link
                  href={`/personel/${cihaz.zimmetliPersonel.id}`}
                  className="text-sm font-semibold text-brand"
                >
                  {cihaz.zimmetliPersonel.ad} {cihaz.zimmetliPersonel.soyad}
                </Link>
                <p className="text-xs text-muted">
                  {cihaz.zimmetliPersonel.unvan ?? ""}
                  {cihaz.zimmetliPersonel.departman
                    ? ` · ${cihaz.zimmetliPersonel.departman.ad}`
                    : ""}
                </p>
              </div>
            ) : (
              <p className="mb-4 text-sm text-muted">
                Cihaz şu anda kimseye zimmetli değil.
              </p>
            )}

            <form action={zimmetVer} className="yazdirma-gizle space-y-2">
              <input type="hidden" name="cihazId" value={cihaz.id} />
              <label
                htmlFor="personelId"
                className="block text-xs font-medium text-muted"
              >
                {cihaz.zimmetliPersonel ? "Başka personele devret" : "Personele zimmetle"}
              </label>
              <select
                id="personelId"
                name="personelId"
                required
                defaultValue=""
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
              >
                <option value="" disabled>
                  Personel seçin
                </option>
                {personeller.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.ad} {p.soyad}
                    {p.departman ? ` — ${p.departman.ad}` : ""}
                  </option>
                ))}
              </select>
              <input
                name="aciklama"
                placeholder="Açıklama (isteğe bağlı)"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <Buton type="submit" tur="birincil">
                Kaydet
              </Buton>
            </form>

            {cihaz.zimmetliPersonel ? (
              <form
                action={zimmetIadeAl}
                className="yazdirma-gizle mt-3 border-t border-line pt-3"
              >
                <input type="hidden" name="cihazId" value={cihaz.id} />
                <Buton type="submit">Zimmeti iade al</Buton>
              </form>
            ) : null}
          </Kart>

          <Kart baslik="Durum değiştir">
            <form action={durumGuncelle} className="yazdirma-gizle space-y-2">
              <input type="hidden" name="cihazId" value={cihaz.id} />
              <select
                name="durum"
                defaultValue={cihaz.durum}
                aria-label="Cihaz durumu"
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
              >
                {CIHAZ_DURUM_LISTESI.map((d) => (
                  <option key={d} value={d}>
                    {cihazDurumEtiketi(d)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted">
                Zimmetli dışındaki bir duruma geçildiğinde mevcut zimmet
                otomatik olarak düşülür.
              </p>
              <Buton type="submit">Güncelle</Buton>
            </form>
          </Kart>
        </div>
      </div>
    </>
  );
}
