import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BosDurum, Buton, SayfaBasligi } from "@/components/arayuz";
import { bosDegilse } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function tekDeger(deger: string | string[] | undefined) {
  if (Array.isArray(deger)) return deger[0] ?? "";
  return deger ?? "";
}

export default async function PersonelSayfasi(props: PageProps<"/personel">) {
  const sorgu = await props.searchParams;
  const arama = tekDeger(sorgu.arama).trim();
  const departmanId = tekDeger(sorgu.departman);

  const kosul: Prisma.PersonelWhereInput = {};
  if (departmanId) kosul.departmanId = Number(departmanId);
  if (arama) {
    kosul.OR = [
      { ad: { contains: arama } },
      { soyad: { contains: arama } },
      { sicilNo: { contains: arama } },
      { eposta: { contains: arama } },
      { unvan: { contains: arama } },
    ];
  }

  const [personeller, departmanlar] = await Promise.all([
    prisma.personel.findMany({
      where: kosul,
      include: {
        departman: true,
        lokasyon: true,
        _count: { select: { cihazlar: true } },
      },
      orderBy: [{ ad: "asc" }, { soyad: "asc" }],
    }),
    prisma.departman.findMany({ orderBy: { ad: "asc" } }),
  ]);

  return (
    <>
      <SayfaBasligi
        baslik="Personel"
        aciklama={`${personeller.length} kayıt listeleniyor.`}
        eylem={<Buton href="/api/disa-aktar/personel">CSV indir</Buton>}
      />

      <form
        method="get"
        className="yazdirma-gizle mb-4 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3"
      >
        <div className="sm:col-span-2">
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
            placeholder="Ad, soyad, sicil no, unvan veya e-posta"
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label
            htmlFor="departman"
            className="mb-1 block text-xs font-medium text-muted"
          >
            Departman
          </label>
          <select
            id="departman"
            name="departman"
            defaultValue={departmanId}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Tümü</option>
            {departmanlar.map((d) => (
              <option key={d.id} value={d.id}>
                {d.ad}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 sm:col-span-3">
          <Buton type="submit" tur="birincil">
            Filtrele
          </Buton>
          {arama || departmanId ? <Buton href="/personel">Temizle</Buton> : null}
        </div>
      </form>

      <div className="tablo-sarmal rounded-xl border border-line bg-surface">
        {personeller.length === 0 ? (
          <BosDurum mesaj="Aramanıza uygun personel bulunamadı." />
        ) : (
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-medium">Sicil no</th>
                <th className="px-4 py-3 font-medium">Ad soyad</th>
                <th className="px-4 py-3 font-medium">Unvan</th>
                <th className="px-4 py-3 font-medium">Departman</th>
                <th className="px-4 py-3 font-medium">Lokasyon</th>
                <th className="px-4 py-3 font-medium">Zimmetli cihaz</th>
              </tr>
            </thead>
            <tbody>
              {personeller.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-background"
                >
                  <td className="px-4 py-3 font-mono text-xs">{p.sicilNo}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/personel/${p.id}`}
                      className="font-medium text-brand"
                    >
                      {p.ad} {p.soyad}
                    </Link>
                    <p className="text-xs text-muted">{bosDegilse(p.eposta)}</p>
                  </td>
                  <td className="px-4 py-3">{bosDegilse(p.unvan)}</td>
                  <td className="px-4 py-3">{p.departman?.ad ?? "—"}</td>
                  <td className="px-4 py-3">{p.lokasyon?.ad ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {p._count.cihazlar}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
