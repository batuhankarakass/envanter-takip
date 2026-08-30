import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BosDurum, Buton, Rozet, SayfaBasligi } from "@/components/arayuz";
import {
  CIHAZ_DURUM_LISTESI,
  CIHAZ_TIP_LISTESI,
  DURUM_RENKLERI,
  cihazDurumEtiketi,
  cihazTipiEtiketi,
} from "@/lib/sabitler";
import { bosDegilse, tarihYaz } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const SAYFA_BOYU = 25;

function tekDeger(deger: string | string[] | undefined) {
  if (Array.isArray(deger)) return deger[0] ?? "";
  return deger ?? "";
}

export default async function CihazlarSayfasi(props: PageProps<"/cihazlar">) {
  const sorgu = await props.searchParams;

  const arama = tekDeger(sorgu.arama).trim();
  const durum = tekDeger(sorgu.durum);
  const tip = tekDeger(sorgu.tip);
  const lokasyonId = tekDeger(sorgu.lokasyon);
  const sayfa = Math.max(1, Number(tekDeger(sorgu.sayfa)) || 1);

  const kosul: Prisma.CihazWhereInput = {};
  if (durum) kosul.durum = durum;
  if (tip) kosul.tip = tip;
  if (lokasyonId) kosul.lokasyonId = Number(lokasyonId);
  if (arama) {
    kosul.OR = [
      { envanterKodu: { contains: arama } },
      { marka: { contains: arama } },
      { model: { contains: arama } },
      { seriNo: { contains: arama } },
      { ipAdresi: { contains: arama } },
      { zimmetliPersonel: { ad: { contains: arama } } },
      { zimmetliPersonel: { soyad: { contains: arama } } },
    ];
  }

  const [cihazlar, toplam, lokasyonlar] = await Promise.all([
    prisma.cihaz.findMany({
      where: kosul,
      include: { lokasyon: true, zimmetliPersonel: true, departman: true },
      orderBy: { envanterKodu: "asc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
    }),
    prisma.cihaz.count({ where: kosul }),
    prisma.lokasyon.findMany({ orderBy: { ad: "asc" } }),
  ]);

  const sonSayfa = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));

  /** Sayfalama baglantilari icin mevcut filtreleri korur. */
  function sayfaBaglantisi(hedef: number) {
    const p = new URLSearchParams();
    if (arama) p.set("arama", arama);
    if (durum) p.set("durum", durum);
    if (tip) p.set("tip", tip);
    if (lokasyonId) p.set("lokasyon", lokasyonId);
    p.set("sayfa", String(hedef));
    return `/cihazlar?${p.toString()}`;
  }

  const filtreVar = Boolean(arama || durum || tip || lokasyonId);

  return (
    <>
      <SayfaBasligi
        baslik="Cihazlar"
        aciklama={`${toplam} kayıt listeleniyor.`}
        eylem={
          <>
            <Buton href="/api/disa-aktar/cihazlar">CSV indir</Buton>
            <Buton href="/cihazlar/yeni" tur="birincil">
              Yeni cihaz
            </Buton>
          </>
        }
      />

      <form
        method="get"
        className="yazdirma-gizle mb-4 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <label
            htmlFor="arama"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Ara
          </label>
          <input
            id="arama"
            name="arama"
            defaultValue={arama}
            placeholder="Kod, marka, model, seri no, IP veya personel"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>

        <div>
          <label
            htmlFor="durum"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Durum
          </label>
          <select
            id="durum"
            name="durum"
            defaultValue={durum}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Tümü</option>
            {CIHAZ_DURUM_LISTESI.map((d) => (
              <option key={d} value={d}>
                {cihazDurumEtiketi(d)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="tip"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Tür
          </label>
          <select
            id="tip"
            name="tip"
            defaultValue={tip}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Tümü</option>
            {CIHAZ_TIP_LISTESI.map((t) => (
              <option key={t} value={t}>
                {cihazTipiEtiketi(t)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lokasyon"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Lokasyon
          </label>
          <select
            id="lokasyon"
            name="lokasyon"
            defaultValue={lokasyonId}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Tümü</option>
            {lokasyonlar.map((l) => (
              <option key={l.id} value={l.id}>
                {l.ad}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Buton type="submit" tur="birincil">
            Filtrele
          </Buton>
          {filtreVar ? <Buton href="/cihazlar">Temizle</Buton> : null}
        </div>
      </form>

      <div className="tablo-sarmal rounded-xl border border-line bg-surface">
        {cihazlar.length === 0 ? (
          <BosDurum mesaj="Aramanıza uygun cihaz bulunamadı." />
        ) : (
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Envanter kodu</th>
                <th className="px-4 py-3 font-medium">Cihaz</th>
                <th className="px-4 py-3 font-medium">Tür</th>
                <th className="px-4 py-3 font-medium">IP adresi</th>
                <th className="px-4 py-3 font-medium">Zimmetli</th>
                <th className="px-4 py-3 font-medium">Lokasyon</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium">Sonraki bakım</th>
              </tr>
            </thead>
            <tbody>
              {cihazlar.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line last:border-0 hover:bg-background"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/cihazlar/${c.id}`}
                      className="font-medium text-brand"
                    >
                      {c.envanterKodu}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.marka}</p>
                    <p className="text-xs text-muted">{c.model}</p>
                  </td>
                  <td className="px-4 py-3">{cihazTipiEtiketi(c.tip)}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {bosDegilse(c.ipAdresi)}
                  </td>
                  <td className="px-4 py-3">
                    {c.zimmetliPersonel ? (
                      <Link
                        href={`/personel/${c.zimmetliPersonel.id}`}
                        className="hover:text-brand"
                      >
                        {c.zimmetliPersonel.ad} {c.zimmetliPersonel.soyad}
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.lokasyon?.ad ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Rozet renk={DURUM_RENKLERI[c.durum]}>
                      {cihazDurumEtiketi(c.durum)}
                    </Rozet>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {tarihYaz(c.sonrakiBakim)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sonSayfa > 1 ? (
        <nav className="yazdirma-gizle mt-4 flex items-center justify-between text-sm">
          <span className="text-muted">
            Sayfa {sayfa} / {sonSayfa}
          </span>
          <div className="flex gap-2">
            {sayfa > 1 ? (
              <Buton href={sayfaBaglantisi(sayfa - 1)}>Önceki</Buton>
            ) : null}
            {sayfa < sonSayfa ? (
              <Buton href={sayfaBaglantisi(sayfa + 1)}>Sonraki</Buton>
            ) : null}
          </div>
        </nav>
      ) : null}
    </>
  );
}
