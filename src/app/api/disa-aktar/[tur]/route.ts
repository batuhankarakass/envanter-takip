import { prisma } from "@/lib/prisma";
import {
  cihazDurumEtiketi,
  cihazTipiEtiketi,
  lisansTipiEtiketi,
} from "@/lib/sabitler";

/**
 * Envanter kayitlarini CSV olarak disa aktarir.
 * Excel'in Turkce yerel ayarinda dogru acilmasi icin ayrac noktali virgul,
 * dosya basina da UTF-8 BOM eklenir.
 */

const AYRAC = ";";

function hucre(deger: unknown) {
  if (deger === null || deger === undefined) return "";
  const metin = String(deger);
  // Ayrac, tirnak veya satir sonu iceren degerler tirnaklanir.
  if (/["\n\r;]/.test(metin)) {
    return `"${metin.replace(/"/g, '""')}"`;
  }
  return metin;
}

function csvYap(basliklar: string[], satirlar: unknown[][]) {
  const govde = [basliklar, ...satirlar]
    .map((satir) => satir.map(hucre).join(AYRAC))
    .join("\r\n");
  // UTF-8 BOM
  return "﻿" + govde;
}

function gunBicimi(tarih: Date | null) {
  if (!tarih) return "";
  const g = String(tarih.getDate()).padStart(2, "0");
  const a = String(tarih.getMonth() + 1).padStart(2, "0");
  return `${g}.${a}.${tarih.getFullYear()}`;
}

function csvYaniti(icerik: string, dosyaAdi: string) {
  return new Response(icerik, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(_istek: Request, ctx: RouteContext<"/api/disa-aktar/[tur]">) {
  const { tur } = await ctx.params;

  if (tur === "cihazlar") {
    const cihazlar = await prisma.cihaz.findMany({
      include: { lokasyon: true, departman: true, zimmetliPersonel: true },
      orderBy: { envanterKodu: "asc" },
    });

    const icerik = csvYap(
      [
        "Envanter Kodu",
        "Tur",
        "Marka",
        "Model",
        "Seri No",
        "IP Adresi",
        "MAC Adresi",
        "Durum",
        "Lokasyon",
        "Departman",
        "Zimmetli Personel",
        "Alim Tarihi",
        "Garanti Bitisi",
        "Sonraki Bakim",
        "Notlar",
      ],
      cihazlar.map((c) => [
        c.envanterKodu,
        cihazTipiEtiketi(c.tip),
        c.marka,
        c.model,
        c.seriNo,
        c.ipAdresi,
        c.macAdresi,
        cihazDurumEtiketi(c.durum),
        c.lokasyon?.ad,
        c.departman?.ad,
        c.zimmetliPersonel
          ? `${c.zimmetliPersonel.ad} ${c.zimmetliPersonel.soyad}`
          : "",
        gunBicimi(c.alimTarihi),
        gunBicimi(c.garantiBitis),
        gunBicimi(c.sonrakiBakim),
        c.notlar,
      ]),
    );
    return csvYaniti(icerik, "cihazlar.csv");
  }

  if (tur === "personel") {
    const personeller = await prisma.personel.findMany({
      include: {
        departman: true,
        lokasyon: true,
        _count: { select: { cihazlar: true } },
      },
      orderBy: [{ ad: "asc" }, { soyad: "asc" }],
    });

    const icerik = csvYap(
      [
        "Sicil No",
        "Ad",
        "Soyad",
        "Unvan",
        "Departman",
        "Lokasyon",
        "E-posta",
        "Telefon",
        "Ise Giris",
        "Zimmetli Cihaz Sayisi",
        "Durum",
      ],
      personeller.map((p) => [
        p.sicilNo,
        p.ad,
        p.soyad,
        p.unvan,
        p.departman?.ad,
        p.lokasyon?.ad,
        p.eposta,
        p.telefon,
        gunBicimi(p.iseGirisTarihi),
        p._count.cihazlar,
        p.aktif ? "Aktif" : "Pasif",
      ]),
    );
    return csvYaniti(icerik, "personel.csv");
  }

  if (tur === "lisanslar") {
    const lisanslar = await prisma.lisans.findMany({
      include: { _count: { select: { atamalar: true } } },
      orderBy: { urunAdi: "asc" },
    });

    const icerik = csvYap(
      [
        "Urun Adi",
        "Uretici",
        "Surum",
        "Tur",
        "Toplam Koltuk",
        "Kullanilan",
        "Baslangic",
        "Bitis",
        "Bedel",
        "Para Birimi",
      ],
      lisanslar.map((l) => [
        l.urunAdi,
        l.uretici,
        l.surum,
        lisansTipiEtiketi(l.tip),
        l.toplamKoltuk,
        l._count.atamalar,
        gunBicimi(l.baslangicTarihi),
        gunBicimi(l.bitisTarihi),
        // Lisans anahtari guvenlik gerekcesiyle disa aktarilmaz.
        l.satinAlmaBedeli ?? "",
        l.paraBirimi,
      ]),
    );
    return csvYaniti(icerik, "lisanslar.csv");
  }

  return new Response("Bilinmeyen dışa aktarma türü.", { status: 404 });
}
