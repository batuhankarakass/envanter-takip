import { prisma } from "@/lib/prisma";
import { Kart, SayfaBasligi } from "@/components/arayuz";
import { YeniCihazFormu } from "./form";

export const dynamic = "force-dynamic";

export default async function YeniCihazSayfasi() {
  const [lokasyonlar, departmanlar, personeller] = await Promise.all([
    prisma.lokasyon.findMany({ orderBy: { ad: "asc" } }),
    prisma.departman.findMany({ orderBy: { ad: "asc" } }),
    prisma.personel.findMany({
      where: { aktif: true },
      orderBy: [{ ad: "asc" }, { soyad: "asc" }],
      include: { departman: true },
    }),
  ]);

  return (
    <>
      <SayfaBasligi
        baslik="Yeni cihaz"
        aciklama="Envantere yeni bir donanım kaydı ekleyin."
      />
      <Kart>
        <YeniCihazFormu
          lokasyonlar={lokasyonlar.map((l) => ({ id: l.id, ad: l.ad }))}
          departmanlar={departmanlar.map((d) => ({ id: d.id, ad: d.ad }))}
          personeller={personeller.map((p) => ({
            id: p.id,
            ad: `${p.ad} ${p.soyad}${p.departman ? ` — ${p.departman.ad}` : ""}`,
          }))}
        />
      </Kart>
    </>
  );
}
