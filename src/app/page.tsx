import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  BosDurum,
  Kart,
  OzetKutusu,
  Rozet,
  SayfaBasligi,
} from "@/components/arayuz";
import {
  DURUM_RENKLERI,
  cihazDurumEtiketi,
  cihazTipiEtiketi,
  zimmetHareketEtiketi,
} from "@/lib/sabitler";
import { kalanGun, tarihYaz } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Bugunden itibaren verilen gun kadar ileri bir tarih uretir. */
function ileriTarih(gun: number) {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  t.setDate(t.getDate() + gun);
  return t;
}

export default async function PanelSayfasi() {
  const bugun = new Date();
  const otuzGunSonra = ileriTarih(30);
  const altmisGunSonra = ileriTarih(60);

  const [
    toplamCihaz,
    zimmetliCihaz,
    aktifPersonel,
    lokasyonSayisi,
    durumDagilimi,
    tipDagilimi,
    bakimiYaklasan,
    suresiYaklasanLisanslar,
    sonHareketler,
    lisanslar,
  ] = await Promise.all([
    prisma.cihaz.count(),
    prisma.cihaz.count({ where: { durum: "ZIMMETLI" } }),
    prisma.personel.count({ where: { aktif: true } }),
    prisma.lokasyon.count(),
    prisma.cihaz.groupBy({ by: ["durum"], _count: { _all: true } }),
    prisma.cihaz.groupBy({ by: ["tip"], _count: { _all: true } }),
    prisma.cihaz.findMany({
      where: { sonrakiBakim: { gte: bugun, lte: otuzGunSonra } },
      orderBy: { sonrakiBakim: "asc" },
      take: 6,
      include: { lokasyon: true },
    }),
    prisma.lisans.findMany({
      where: { bitisTarihi: { gte: bugun, lte: altmisGunSonra } },
      orderBy: { bitisTarihi: "asc" },
      take: 6,
    }),
    prisma.zimmetHareketi.findMany({
      orderBy: { tarih: "desc" },
      take: 6,
      include: { cihaz: true, personel: true },
    }),
    prisma.lisans.findMany({
      include: { _count: { select: { atamalar: true } } },
      orderBy: { urunAdi: "asc" },
    }),
  ]);

  const enCokKullanilan = [...tipDagilimi]
    .sort((a, b) => b._count._all - a._count._all)
    .slice(0, 6);

  const doluLisanslar = lisanslar
    .map((l) => ({
      ...l,
      doluluk:
        l.toplamKoltuk > 0
          ? Math.round((l._count.atamalar / l.toplamKoltuk) * 100)
          : 0,
    }))
    .sort((a, b) => b.doluluk - a.doluluk)
    .slice(0, 5);

  return (
    <>
      <SayfaBasligi
        baslik="Panel"
        aciklama="Bilişim envanterinin, zimmet durumunun ve lisans kullanımının genel görünümü."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OzetKutusu
          etiket="Toplam cihaz"
          deger={toplamCihaz}
          altBilgi={`${zimmetliCihaz} tanesi zimmetli`}
          href="/cihazlar"
        />
        <OzetKutusu
          etiket="Aktif personel"
          deger={aktifPersonel}
          altBilgi={`${lokasyonSayisi} lokasyonda`}
          href="/personel"
        />
        <OzetKutusu
          etiket="Bakımı yaklaşan"
          deger={bakimiYaklasan.length}
          altBilgi="Önümüzdeki 30 gün içinde"
          href="/raporlar"
        />
        <OzetKutusu
          etiket="Süresi dolan lisans"
          deger={suresiYaklasanLisanslar.length}
          altBilgi="Önümüzdeki 60 gün içinde"
          href="/lisanslar"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Kart baslik="Cihaz durumu">
          <ul className="space-y-2.5">
            {durumDagilimi.map((d) => {
              const oran = toplamCihaz
                ? Math.round((d._count._all / toplamCihaz) * 100)
                : 0;
              return (
                <li key={d.durum}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Rozet renk={DURUM_RENKLERI[d.durum]}>
                        {cihazDurumEtiketi(d.durum)}
                      </Rozet>
                    </span>
                    <span className="tabular-nums text-muted">
                      {d._count._all} · %{oran}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${oran}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Kart>

        <Kart baslik="Cihaz türü dağılımı">
          <ul className="space-y-2">
            {enCokKullanilan.map((t) => (
              <li
                key={t.tip}
                className="flex items-center justify-between border-b border-line py-1.5 text-sm last:border-0"
              >
                <span>{cihazTipiEtiketi(t.tip)}</span>
                <span className="tabular-nums font-medium">
                  {t._count._all}
                </span>
              </li>
            ))}
          </ul>
        </Kart>

        <Kart
          baslik="Bakımı yaklaşan cihazlar"
          ustBilgi={
            <Link href="/raporlar" className="text-xs font-medium text-brand">
              Tümünü gör
            </Link>
          }
        >
          {bakimiYaklasan.length === 0 ? (
            <BosDurum mesaj="Önümüzdeki 30 gün içinde planlanmış bakım yok." />
          ) : (
            <ul className="space-y-2.5">
              {bakimiYaklasan.map((c) => {
                const gun = kalanGun(c.sonrakiBakim);
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b border-line pb-2.5 text-sm last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/cihazlar/${c.id}`}
                        className="font-medium text-brand"
                      >
                        {c.envanterKodu}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {c.marka} {c.model}
                        {c.lokasyon ? ` · ${c.lokasyon.ad}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">
                      {gun === 0 ? "Bugün" : `${gun} gün`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Kart>

        <Kart baslik="Lisans doluluk oranı">
          {doluLisanslar.length === 0 ? (
            <BosDurum mesaj="Kayıtlı lisans bulunmuyor." />
          ) : (
            <ul className="space-y-3">
              {doluLisanslar.map((l) => (
                <li key={l.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <Link
                      href={`/lisanslar/${l.id}`}
                      className="truncate font-medium"
                    >
                      {l.urunAdi}
                    </Link>
                    <span className="shrink-0 tabular-nums text-muted">
                      {l._count.atamalar}/{l.toplamKoltuk}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-background">
                    <div
                      className={`h-full rounded-full ${
                        l.doluluk > 100 ? "bg-rose-500" : "bg-brand"
                      }`}
                      style={{ width: `${Math.min(l.doluluk, 100)}%` }}
                    />
                  </div>
                  {l.doluluk > 100 ? (
                    <p className="mt-1 text-xs text-rose-600">
                      Koltuk sayısı aşıldı — {l._count.atamalar - l.toplamKoltuk}{" "}
                      fazla atama var.
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Kart>
      </div>

      <div className="mt-6">
        <Kart baslik="Son zimmet hareketleri">
          {sonHareketler.length === 0 ? (
            <BosDurum mesaj="Henüz zimmet hareketi kaydedilmemiş." />
          ) : (
            <ul className="space-y-2.5">
              {sonHareketler.map((h) => (
                <li
                  key={h.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2.5 text-sm last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/cihazlar/${h.cihazId}`}
                      className="font-medium text-brand"
                    >
                      {h.cihaz.envanterKodu}
                    </Link>
                    <span className="text-muted">
                      {" "}
                      — {zimmetHareketEtiketi(h.tip)}
                      {h.personel
                        ? ` · ${h.personel.ad} ${h.personel.soyad}`
                        : ""}
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {tarihYaz(h.tarih)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kart>
      </div>
    </>
  );
}
