import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  BosDurum,
  Buton,
  Kart,
  OzetKutusu,
  SayfaBasligi,
} from "@/components/arayuz";
import { cihazTipiEtiketi, lisansTipiEtiketi } from "@/lib/sabitler";
import { kalanGun, paraYaz, tarihYaz } from "@/lib/format";

export const dynamic = "force-dynamic";

function ileriTarih(gun: number) {
  const t = new Date();
  t.setHours(23, 59, 59, 999);
  t.setDate(t.getDate() + gun);
  return t;
}

export default async function RaporlarSayfasi() {
  const bugun = new Date();
  const otuzGunSonra = ileriTarih(30);
  const altmisGunSonra = ileriTarih(60);

  const [
    bakimiGeciken,
    bakimiYaklasan,
    garantisiDolan,
    suresiDolanLisanslar,
    suresiYaklasanLisanslar,
    bostaCihazlar,
    lisanslar,
  ] = await Promise.all([
    prisma.cihaz.findMany({
      where: { sonrakiBakim: { lt: bugun } },
      include: { lokasyon: true },
      orderBy: { sonrakiBakim: "asc" },
      take: 20,
    }),
    prisma.cihaz.findMany({
      where: { sonrakiBakim: { gte: bugun, lte: otuzGunSonra } },
      include: { lokasyon: true },
      orderBy: { sonrakiBakim: "asc" },
      take: 20,
    }),
    prisma.cihaz.findMany({
      where: { garantiBitis: { lt: bugun } },
      orderBy: { garantiBitis: "desc" },
      take: 20,
    }),
    prisma.lisans.findMany({
      where: { bitisTarihi: { lt: bugun } },
      orderBy: { bitisTarihi: "desc" },
    }),
    prisma.lisans.findMany({
      where: { bitisTarihi: { gte: bugun, lte: altmisGunSonra } },
      orderBy: { bitisTarihi: "asc" },
    }),
    prisma.cihaz.findMany({
      where: { durum: "DEPODA" },
      include: { lokasyon: true },
      orderBy: { envanterKodu: "asc" },
      take: 20,
    }),
    prisma.lisans.findMany({
      include: { _count: { select: { atamalar: true } } },
    }),
  ]);

  const koltukAsimi = lisanslar.filter(
    (l) => l._count.atamalar > l.toplamKoltuk,
  );

  return (
    <>
      <SayfaBasligi
        baslik="Raporlar"
        aciklama="Bakım, garanti ve lisans süreleriyle ilgili dikkat gerektiren kayıtlar."
        eylem={
          <>
            <Buton href="/api/disa-aktar/cihazlar">Cihazlar CSV</Buton>
            <Buton href="/api/disa-aktar/lisanslar">Lisanslar CSV</Buton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OzetKutusu
          etiket="Bakımı gecikmiş"
          deger={bakimiGeciken.length}
          altBilgi="Planlanan tarih geçti"
        />
        <OzetKutusu
          etiket="Bakımı yaklaşan"
          deger={bakimiYaklasan.length}
          altBilgi="30 gün içinde"
        />
        <OzetKutusu
          etiket="Garantisi dolan"
          deger={garantisiDolan.length}
          altBilgi="Garanti kapsamı dışında"
        />
        <OzetKutusu
          etiket="Koltuk aşımı"
          deger={koltukAsimi.length}
          altBilgi="Lisans limitini aşan"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Kart baslik="Bakımı gecikmiş cihazlar">
          {bakimiGeciken.length === 0 ? (
            <BosDurum mesaj="Bakımı gecikmiş cihaz yok." />
          ) : (
            <ul className="space-y-2">
              {bakimiGeciken.map((c) => {
                const gun = kalanGun(c.sonrakiBakim);
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/cihazlar/${c.id}`}
                        className="font-medium text-brand"
                      >
                        {c.envanterKodu}
                      </Link>
                      <p className="truncate text-xs text-muted">
                        {cihazTipiEtiketi(c.tip)} · {c.marka} {c.model}
                        {c.lokasyon ? ` · ${c.lokasyon.ad}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-amber-600">
                      {gun === null
                        ? "—"
                        : gun === 0
                          ? "Bugün"
                          : `${Math.abs(gun)} gün gecikti`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Kart>

        <Kart baslik="Bakımı yaklaşan cihazlar (30 gün)">
          {bakimiYaklasan.length === 0 ? (
            <BosDurum mesaj="Yaklaşan bakım yok." />
          ) : (
            <ul className="space-y-2">
              {bakimiYaklasan.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
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
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {tarihYaz(c.sonrakiBakim)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart baslik="Süresi dolan lisanslar">
          {suresiDolanLisanslar.length === 0 ? (
            <BosDurum mesaj="Süresi dolmuş lisans yok." />
          ) : (
            <ul className="space-y-2">
              {suresiDolanLisanslar.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/lisanslar/${l.id}`}
                      className="font-medium text-brand"
                    >
                      {l.urunAdi}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {l.uretici} · {lisansTipiEtiketi(l.tip)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-rose-600">
                    {tarihYaz(l.bitisTarihi)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart baslik="Süresi yaklaşan lisanslar (60 gün)">
          {suresiYaklasanLisanslar.length === 0 ? (
            <BosDurum mesaj="Yakın zamanda dolacak lisans yok." />
          ) : (
            <ul className="space-y-2">
              {suresiYaklasanLisanslar.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/lisanslar/${l.id}`}
                      className="font-medium text-brand"
                    >
                      {l.urunAdi}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {paraYaz(l.satinAlmaBedeli, l.paraBirimi ?? "TRY")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-amber-600">
                    {tarihYaz(l.bitisTarihi)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart baslik="Lisans koltuk aşımı">
          {koltukAsimi.length === 0 ? (
            <BosDurum mesaj="Koltuk sayısını aşan lisans yok." />
          ) : (
            <ul className="space-y-2">
              {koltukAsimi.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
                >
                  <Link
                    href={`/lisanslar/${l.id}`}
                    className="font-medium text-brand"
                  >
                    {l.urunAdi}
                  </Link>
                  <span className="shrink-0 text-xs text-rose-600">
                    {l._count.atamalar} / {l.toplamKoltuk} —{" "}
                    {l._count.atamalar - l.toplamKoltuk} fazla
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart baslik="Depoda bekleyen cihazlar">
          {bostaCihazlar.length === 0 ? (
            <BosDurum mesaj="Depoda bekleyen cihaz yok." />
          ) : (
            <ul className="space-y-2">
              {bostaCihazlar.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 border-b border-line py-2 text-sm last:border-0"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/cihazlar/${c.id}`}
                      className="font-medium text-brand"
                    >
                      {c.envanterKodu}
                    </Link>
                    <p className="truncate text-xs text-muted">
                      {cihazTipiEtiketi(c.tip)} · {c.marka} {c.model}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted">
                    {c.lokasyon?.ad ?? "—"}
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
