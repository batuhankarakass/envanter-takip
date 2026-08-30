import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BosDurum, Kart, SayfaBasligi } from "@/components/arayuz";
import { bosDegilse } from "@/lib/format";

export const dynamic = "force-dynamic";

/** "3" -> "3. kat", "Zemin" -> "Zemin kat" */
function katYaz(kat: string | null) {
  if (!kat) return null;
  return /^\d+$/.test(kat) ? `${kat}. kat` : `${kat} kat`;
}

export default async function LokasyonlarSayfasi() {
  const [lokasyonlar, departmanlar] = await Promise.all([
    prisma.lokasyon.findMany({
      include: { _count: { select: { cihazlar: true, personeller: true } } },
      orderBy: { ad: "asc" },
    }),
    prisma.departman.findMany({
      include: { _count: { select: { cihazlar: true, personeller: true } } },
      orderBy: { ad: "asc" },
    }),
  ]);

  return (
    <>
      <SayfaBasligi
        baslik="Lokasyonlar ve departmanlar"
        aciklama="Cihaz ve personelin fiziksel ile organizasyonel dağılımı."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Kart baslik={`Lokasyonlar (${lokasyonlar.length})`}>
          {lokasyonlar.length === 0 ? (
            <BosDurum mesaj="Kayıtlı lokasyon yok." />
          ) : (
            <ul className="space-y-2">
              {lokasyonlar.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2.5 text-sm last:border-0"
                >
                  <div>
                    <Link
                      href={`/cihazlar?lokasyon=${l.id}`}
                      className="font-medium text-brand"
                    >
                      {l.ad}
                    </Link>
                    <p className="text-xs text-muted">
                      {[l.bina, katYaz(l.kat), l.aciklama]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>
                      <span className="font-medium text-foreground">
                        {l._count.cihazlar}
                      </span>{" "}
                      cihaz
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        {l._count.personeller}
                      </span>{" "}
                      personel
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Kart>

        <Kart baslik={`Departmanlar (${departmanlar.length})`}>
          {departmanlar.length === 0 ? (
            <BosDurum mesaj="Kayıtlı departman yok." />
          ) : (
            <ul className="space-y-2">
              {departmanlar.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2.5 text-sm last:border-0"
                >
                  <div>
                    <Link
                      href={`/personel?departman=${d.id}`}
                      className="font-medium text-brand"
                    >
                      {d.ad}
                    </Link>
                    <p className="text-xs text-muted">
                      Kod: {bosDegilse(d.kod)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted">
                    <p>
                      <span className="font-medium text-foreground">
                        {d._count.cihazlar}
                      </span>{" "}
                      cihaz
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        {d._count.personeller}
                      </span>{" "}
                      personel
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Kart>
      </div>
    </>
  );
}
