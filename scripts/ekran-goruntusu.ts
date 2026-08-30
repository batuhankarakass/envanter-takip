/**
 * Uygulamanin sayfalarinin ekran goruntusunu alir.
 *
 * Kullanim:
 *   1) Ayri bir terminalde: npm run dev
 *   2) npm run ss
 *
 * Ciktilar: ekran-goruntuleri/ klasorune PNG olarak yazilir.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const ADRES = process.env.SS_ADRES ?? "http://localhost:3000";
const KLASOR = path.join(process.cwd(), "ekran-goruntuleri");

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  }),
});

/** Detay sayfalari icin veritabanindaki gercek ID'leri okur. */
async function ornekIdler() {
  const cihaz = await prisma.cihaz.findFirst({ orderBy: { id: "asc" } });
  const personel = await prisma.personel.findFirst({ orderBy: { id: "asc" } });
  // Atamasi olan bir lisans sec ki detay sayfasi dolu gorunsun.
  const lisans =
    (await prisma.lisans.findFirst({
      where: { atamalar: { some: {} } },
      orderBy: { id: "asc" },
    })) ?? (await prisma.lisans.findFirst({ orderBy: { id: "asc" } }));
  return {
    cihazId: cihaz?.id ?? 1,
    personelId: personel?.id ?? 1,
    lisansId: lisans?.id ?? 1,
  };
}

type Sayfa = {
  dosya: string;
  yol: string;
  aciklama: string;
  /** Tam sayfa mi, yoksa yalnizca gorunen alan mi */
  tamSayfa?: boolean;
};

async function main() {
  await mkdir(KLASOR, { recursive: true });

  const { cihazId, personelId, lisansId } = await ornekIdler();

  const SAYFALAR: Sayfa[] = [
    { dosya: "01-panel", yol: "/", aciklama: "Panel (genel görünüm)", tamSayfa: true },
    { dosya: "02-cihaz-listesi", yol: "/cihazlar", aciklama: "Cihaz listesi", tamSayfa: true },
    {
      dosya: "03-cihaz-filtre",
      yol: "/cihazlar?durum=BAKIMDA",
      aciklama: "Cihaz listesi - duruma göre filtreleme",
      tamSayfa: true,
    },
    {
      dosya: "04-cihaz-arama",
      yol: "/cihazlar?arama=10.10.10",
      aciklama: "Cihaz listesi - IP adresine göre arama",
      tamSayfa: true,
    },
    { dosya: "05-cihaz-detay", yol: `/cihazlar/${cihazId}`, aciklama: "Cihaz detayı ve zimmet geçmişi", tamSayfa: true },
    { dosya: "06-yeni-cihaz", yol: "/cihazlar/yeni", aciklama: "Yeni cihaz kayıt formu", tamSayfa: true },
    { dosya: "07-personel-listesi", yol: "/personel", aciklama: "Personel listesi", tamSayfa: true },
    { dosya: "08-personel-detay", yol: `/personel/${personelId}`, aciklama: "Personel detayı ve zimmetli cihazları", tamSayfa: true },
    { dosya: "09-lisans-listesi", yol: "/lisanslar", aciklama: "Lisans listesi ve koltuk kullanımı", tamSayfa: true },
    { dosya: "10-lisans-detay", yol: `/lisanslar/${lisansId}`, aciklama: "Lisans detayı ve atamalar", tamSayfa: true },
    { dosya: "11-lokasyonlar", yol: "/lokasyonlar", aciklama: "Lokasyon ve departman dağılımı", tamSayfa: true },
    { dosya: "12-raporlar", yol: "/raporlar", aciklama: "Bakım, garanti ve lisans raporları", tamSayfa: true },
  ];

  const RAPOR_KLASOR = path.join(KLASOR, "rapor");
  await mkdir(RAPOR_KLASOR, { recursive: true });

  const tarayici = await chromium.launch();
  const baglam = await tarayici.newContext({
    viewport: { width: 1360, height: 1500 },
    // Raporda net gorunmesi icin iki kat cozunurluk
    deviceScaleFactor: 2,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    colorScheme: "light",
  });
  const sayfa = await baglam.newPage();

  for (const s of SAYFALAR) {
    const hedef = ADRES + s.yol;
    try {
      await sayfa.goto(hedef, { waitUntil: "networkidle", timeout: 30_000 });
      // Next.js gelistirici gostergesini ekran goruntusunde gizle
      await sayfa.addStyleTag({
        content:
          "nextjs-portal, #__next-dev-tools-indicator, [data-nextjs-dev-tools-button] { display: none !important; }",
      });
      // Yazi tiplerinin yerlesmesi icin kisa bekleme
      await sayfa.waitForTimeout(400);
      // Tam sayfa (ekler icin)
      await sayfa.screenshot({
        path: path.join(KLASOR, `${s.dosya}.png`),
        fullPage: s.tamSayfa ?? false,
      });
      // Rapor icinde kullanmak icin yalnizca gorunen alan (viewport)
      await sayfa.screenshot({
        path: path.join(RAPOR_KLASOR, `${s.dosya}.png`),
        fullPage: false,
      });
      console.log(`✓ ${s.dosya}.png — ${s.aciklama}`);
    } catch (hata) {
      console.error(`✗ ${s.dosya} alınamadı (${hedef}):`, (hata as Error).message);
    }
  }

  await tarayici.close();
  await prisma.$disconnect();
  console.log(`\nEkran görüntüleri: ${KLASOR}`);
}

main().catch((hata) => {
  console.error("Ekran görüntüsü alınamadı:", hata);
  process.exit(1);
});
