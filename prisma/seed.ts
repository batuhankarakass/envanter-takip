/**
 * Ornek veri yukleyici.
 *
 * Buradaki butun isim, IP, seri numarasi ve lisans anahtarlari UYDURMADIR.
 * Gercek bir kurumun verisi bu depoda yer almaz.
 *
 * Calistirmak icin: npm run db:seed
 */
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

/** Deterministik sozde-rastgele uretec: her calistirmada ayni veri olusur. */
function uretec(tohum: number) {
  let t = tohum;
  return () => {
    t = (t * 1103515245 + 12345) & 0x7fffffff;
    return t / 0x7fffffff;
  };
}
const rastgele = uretec(20260727);

function sec<T>(dizi: readonly T[]): T {
  return dizi[Math.floor(rastgele() * dizi.length)];
}

function tarih(gunOnce: number) {
  const t = new Date();
  t.setHours(9, 0, 0, 0);
  t.setDate(t.getDate() - gunOnce);
  return t;
}

const LOKASYONLAR = [
  { ad: "Merkez Bina 1. Kat", bina: "Merkez", kat: "1", aciklama: "İdari ofisler" },
  { ad: "Merkez Bina 2. Kat", bina: "Merkez", kat: "2", aciklama: "Satış ve muhasebe" },
  { ad: "Merkez Bina 3. Kat", bina: "Merkez", kat: "3", aciklama: "Ar-Ge ve bilgi işlem" },
  { ad: "Üretim Holü A", bina: "Üretim", kat: "Zemin", aciklama: "Talaşlı imalat" },
  { ad: "Üretim Holü B", bina: "Üretim", kat: "Zemin", aciklama: "Montaj hattı" },
  { ad: "Kalite Laboratuvarı", bina: "Üretim", kat: "1", aciklama: "Ölçüm ve test" },
  { ad: "Depo ve Sevkiyat", bina: "Lojistik", kat: "Zemin", aciklama: "Ambar" },
];

const DEPARTMANLAR = [
  { ad: "Bilgi İşlem", kod: "BI" },
  { ad: "Muhasebe", kod: "MH" },
  { ad: "İnsan Kaynakları", kod: "IK" },
  { ad: "Yurtiçi Satış", kod: "YS" },
  { ad: "Ar-Ge", kod: "ARGE" },
  { ad: "Üretim", kod: "URT" },
  { ad: "Kalite Kontrol", kod: "KK" },
  { ad: "Sevkiyat", kod: "SVK" },
];

const PERSONELLER = [
  ["Ahmet", "Yılmaz", "Bilgi İşlem", "Sistem Yöneticisi"],
  ["Elif", "Demir", "Bilgi İşlem", "Yazılım Uzmanı"],
  ["Mert", "Kaya", "Bilgi İşlem", "Teknik Destek"],
  ["Zeynep", "Şahin", "Muhasebe", "Muhasebe Müdürü"],
  ["Burak", "Çelik", "Muhasebe", "Ön Muhasebe Sorumlusu"],
  ["Ayşe", "Doğan", "İnsan Kaynakları", "İK Uzmanı"],
  ["Can", "Arslan", "İnsan Kaynakları", "İK Müdürü"],
  ["Selin", "Aydın", "Yurtiçi Satış", "Satış Temsilcisi"],
  ["Emre", "Koç", "Yurtiçi Satış", "Bölge Satış Müdürü"],
  ["Deniz", "Kurt", "Yurtiçi Satış", "Satış Temsilcisi"],
  ["Gizem", "Özkan", "Ar-Ge", "Tasarım Mühendisi"],
  ["Onur", "Polat", "Ar-Ge", "Mekanik Tasarım Mühendisi"],
  ["Ece", "Erdoğan", "Ar-Ge", "Ar-Ge Müdürü"],
  ["Kaan", "Yıldız", "Ar-Ge", "Proje Mühendisi"],
  ["Merve", "Aslan", "Üretim", "Üretim Planlama Sorumlusu"],
  ["Serkan", "Taş", "Üretim", "Vardiya Amiri"],
  ["Buse", "Güneş", "Üretim", "Üretim Müdürü"],
  ["Tolga", "Bulut", "Üretim", "CNC Operatörü"],
  ["Hakan", "Akkaş", "Kalite Kontrol", "Kalite Mühendisi"],
  ["Pınar", "Yavuz", "Kalite Kontrol", "Kalite Kontrol Teknisyeni"],
  ["Cem", "Duman", "Sevkiyat", "Sevkiyat Sorumlusu"],
  ["Nazlı", "Kılıç", "Sevkiyat", "Depo Sorumlusu"],
  ["İrem", "Sarı", "Muhasebe", "Finans Uzmanı"],
  ["Barış", "Tekin", "Yurtiçi Satış", "Satış Destek Uzmanı"],
] as const;

const DIZUSTU = [
  ["HP", "ProBook 450 G10"],
  ["Lenovo", "ThinkPad E15"],
  ["Dell", "Latitude 5540"],
  ["Asus", "ExpertBook B1"],
  ["Huawei", "MateBook D16"],
] as const;

const MASAUSTU = [
  ["Dell", "OptiPlex 7010"],
  ["HP", "ProDesk 400 G9"],
  ["Lenovo", "ThinkCentre M70q"],
  ["Casper", "Nirvana N2H"],
] as const;

const YAZICILAR = [
  ["HP", "LaserJet M428fdn"],
  ["Canon", "i-SENSYS MF445dw"],
  ["Brother", "MFC-L2750DW"],
  ["Kyocera", "ECOSYS M2640idw"],
] as const;

const KAMERALAR = [
  ["Hikvision", "DS-2CD2143G2"],
  ["Dahua", "IPC-HDW2431T"],
] as const;

const AG_CIHAZLARI = [
  ["Cisco", "Catalyst 2960-X"],
  ["MikroTik", "CRS326-24G"],
  ["TP-Link", "TL-SG1024D"],
  ["Ubiquiti", "UniFi Switch 24"],
] as const;

const CNCLER = [
  ["Haas", "VF-2SS"],
  ["Mazak", "QUICK TURN 200"],
  ["DMG Mori", "CLX 350"],
] as const;

const MONITORLER = [
  ["Dell", "P2422H"],
  ["LG", "24MK430H"],
  ["Philips", "243V7QDSB"],
] as const;

function seriNoUret(onEk: string, sira: number) {
  const govde = Math.floor(rastgele() * 900000 + 100000);
  return onEk + govde + sira.toString().padStart(3, "0");
}

function macUret(sira: number) {
  const p1 = (10 + sira).toString(16).padStart(2, "0").toUpperCase();
  const p2 = ((sira * 7) % 256).toString(16).padStart(2, "0").toUpperCase();
  return "00:1B:44:" + p1 + ":3A:" + p2;
}

function sadelestir(metin: string) {
  return metin
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
}

async function main() {
  console.log("Mevcut kayıtlar temizleniyor...");
  await prisma.zimmetHareketi.deleteMany();
  await prisma.lisansAtama.deleteMany();
  await prisma.lisans.deleteMany();
  await prisma.cihaz.deleteMany();
  await prisma.personel.deleteMany();
  await prisma.departman.deleteMany();
  await prisma.lokasyon.deleteMany();

  // Otomatik artan ID sayacini sifirla ki her yuklemede ID'ler 1'den baslasin.
  // Boylece /cihazlar/1 gibi baglantilar seed sonrasi hep gecerli kalir.
  for (const tablo of [
    "ZimmetHareketi",
    "LisansAtama",
    "Lisans",
    "Cihaz",
    "Personel",
    "Departman",
    "Lokasyon",
  ]) {
    await prisma.$executeRawUnsafe(
      "DELETE FROM sqlite_sequence WHERE name = ?",
      tablo,
    );
  }

  console.log("Lokasyonlar ekleniyor...");
  const lokasyonlar: Awaited<ReturnType<typeof prisma.lokasyon.create>>[] = [];
  for (const l of LOKASYONLAR) {
    lokasyonlar.push(await prisma.lokasyon.create({ data: l }));
  }

  console.log("Departmanlar ekleniyor...");
  const departmanlar: Awaited<ReturnType<typeof prisma.departman.create>>[] = [];
  for (const d of DEPARTMANLAR) {
    departmanlar.push(await prisma.departman.create({ data: d }));
  }

  const departmanBul = (ad: string) => departmanlar.find((d) => d.ad === ad)!;
  const lokasyonBul = (ad: string) => lokasyonlar.find((l) => l.ad === ad)!;

  // Departmanin agirlikli olarak bulundugu lokasyon
  const departmanLokasyon: Record<string, string> = {
    "Bilgi İşlem": "Merkez Bina 3. Kat",
    Muhasebe: "Merkez Bina 2. Kat",
    "İnsan Kaynakları": "Merkez Bina 1. Kat",
    "Yurtiçi Satış": "Merkez Bina 2. Kat",
    "Ar-Ge": "Merkez Bina 3. Kat",
    Üretim: "Üretim Holü A",
    "Kalite Kontrol": "Kalite Laboratuvarı",
    Sevkiyat: "Depo ve Sevkiyat",
  };

  console.log("Personel ekleniyor...");
  const personeller: Awaited<ReturnType<typeof prisma.personel.create>>[] = [];
  for (const [sira, kayit] of PERSONELLER.entries()) {
    const [ad, soyad, departman, unvan] = kayit;
    personeller.push(
      await prisma.personel.create({
        data: {
          sicilNo: "P" + (1001 + sira),
          ad,
          soyad,
          unvan,
          eposta: sadelestir(ad) + "." + sadelestir(soyad) + "@ornekfirma.local",
          telefon: "0212 000 " + (1000 + sira).toString().slice(-4),
          departmanId: departmanBul(departman).id,
          lokasyonId: lokasyonBul(departmanLokasyon[departman]).id,
          iseGirisTarihi: tarih(400 + Math.floor(rastgele() * 1200)),
          aktif: true,
        },
      }),
    );
  }

  console.log("Cihazlar ekleniyor...");
  let sayac = 0;
  const cihazlar: Awaited<ReturnType<typeof prisma.cihaz.create>>[] = [];

  // Her personele bir bilgisayar zimmetlenir
  for (const personel of personeller) {
    sayac += 1;
    const uretimSahasi =
      personel.lokasyonId === lokasyonBul("Üretim Holü A").id ||
      personel.lokasyonId === lokasyonBul("Depo ve Sevkiyat").id;
    const secim = uretimSahasi ? sec(MASAUSTU) : sec(DIZUSTU);
    const cihaz = await prisma.cihaz.create({
      data: {
        envanterKodu: "BLG-" + (100 + sayac),
        tip: uretimSahasi ? "MASAUSTU" : "DIZUSTU",
        marka: secim[0],
        model: secim[1],
        seriNo: seriNoUret("SN", sayac),
        ipAdresi: "10.10." + (uretimSahasi ? 30 : 10) + "." + (20 + sayac),
        macAdresi: macUret(sayac),
        durum: "ZIMMETLI",
        departmanId: personel.departmanId,
        lokasyonId: personel.lokasyonId,
        zimmetliPersonelId: personel.id,
        alimTarihi: tarih(200 + Math.floor(rastgele() * 900)),
        garantiBitis: tarih(-Math.floor(rastgele() * 700) + 90),
        sonBakimTarihi: tarih(Math.floor(rastgele() * 180)),
        sonrakiBakim: tarih(-Math.floor(rastgele() * 120)),
      },
    });
    cihazlar.push(cihaz);
    await prisma.zimmetHareketi.create({
      data: {
        cihazId: cihaz.id,
        personelId: personel.id,
        tip: "ZIMMET",
        tarih: cihaz.alimTarihi ?? tarih(300),
        aciklama: "İlk kurulum ve teslim",
      },
    });
  }

  // Ortak kullanim cihazlari (kisiye zimmetli degil)
  const ortakCihazlar: Array<
    [string, readonly (readonly [string, string])[], string, number]
  > = [
    ["YZC", YAZICILAR, "YAZICI", 6],
    ["KAM", KAMERALAR, "KAMERA", 8],
    ["AGC", AG_CIHAZLARI, "AG_CIHAZI", 5],
    ["CNC", CNCLER, "CNC", 4],
    ["MON", MONITORLER, "MONITOR", 10],
  ];

  for (const [onEk, kaynak, tip, adet] of ortakCihazlar) {
    for (let i = 1; i <= adet; i++) {
      sayac += 1;
      const secim = sec(kaynak);
      const lokasyon =
        tip === "CNC"
          ? sec([lokasyonBul("Üretim Holü A"), lokasyonBul("Üretim Holü B")])
          : sec(lokasyonlar);
      const agSegmenti = tip === "CNC" ? 40 : tip === "KAMERA" ? 50 : 20;
      cihazlar.push(
        await prisma.cihaz.create({
          data: {
            envanterKodu: onEk + "-" + (100 + i),
            tip,
            marka: secim[0],
            model: secim[1],
            seriNo: seriNoUret(onEk, sayac),
            ipAdresi:
              tip === "MONITOR" ? null : "10.10." + agSegmenti + "." + (10 + i),
            durum: rastgele() > 0.85 ? "BAKIMDA" : "DEPODA",
            lokasyonId: lokasyon.id,
            alimTarihi: tarih(300 + Math.floor(rastgele() * 1000)),
            sonBakimTarihi: tarih(Math.floor(rastgele() * 200)),
            sonrakiBakim: tarih(-Math.floor(rastgele() * 150)),
            notlar:
              tip === "CNC"
                ? "Üretim ağı VLAN 40 üzerinde, statik IP ile tanımlı."
                : null,
          },
        }),
      );
    }
  }

  console.log("Lisanslar ekleniyor...");
  const lisansTanimlari = [
    { urunAdi: "Windows 11 Pro", uretici: "Microsoft", surum: "23H2", tip: "OEM", toplamKoltuk: 30, bedel: 4200 },
    { urunAdi: "Microsoft 365 İş Standart", uretici: "Microsoft", surum: "2026", tip: "ABONELIK", toplamKoltuk: 25, bedel: 6100 },
    { urunAdi: "SolidWorks Professional", uretici: "Dassault Systemes", surum: "2026", tip: "VOLUME", toplamKoltuk: 4, bedel: 185000 },
    { urunAdi: "AutoCAD", uretici: "Autodesk", surum: "2026", tip: "ABONELIK", toplamKoltuk: 3, bedel: 92000 },
    { urunAdi: "Kaspersky Endpoint Security", uretici: "Kaspersky", surum: "12", tip: "VOLUME", toplamKoltuk: 40, bedel: 38000 },
    { urunAdi: "Adobe Acrobat Pro", uretici: "Adobe", surum: "2026", tip: "ABONELIK", toplamKoltuk: 5, bedel: 21000 },
    { urunAdi: "SQL Server Standard", uretici: "Microsoft", surum: "2022", tip: "VOLUME", toplamKoltuk: 2, bedel: 145000 },
    { urunAdi: "Veeam Backup Essentials", uretici: "Veeam", surum: "12", tip: "ABONELIK", toplamKoltuk: 2, bedel: 54000 },
  ];

  const lisanslar: Awaited<ReturnType<typeof prisma.lisans.create>>[] = [];
  for (const [sira, l] of lisansTanimlari.entries()) {
    lisanslar.push(
      await prisma.lisans.create({
        data: {
          urunAdi: l.urunAdi,
          uretici: l.uretici,
          surum: l.surum,
          tip: l.tip,
          toplamKoltuk: l.toplamKoltuk,
          // Ornek anahtar - gercek bir lisans anahtari degildir.
          lisansAnahtari:
            "ORNEK-" + (sira + 1).toString().padStart(2, "0") + "-XXXXX-XXXXX-XXXXX",
          baslangicTarihi: tarih(300 + sira * 10),
          bitisTarihi: tarih(-(30 + sira * 45)),
          satinAlmaBedeli: l.bedel,
          paraBirimi: "TRY",
        },
      }),
    );
  }

  console.log("Lisans atamaları yapılıyor...");
  const bilgisayarlar = cihazlar.filter(
    (c) => c.tip === "DIZUSTU" || c.tip === "MASAUSTU",
  );
  const windows = lisanslar.find((l) => l.urunAdi === "Windows 11 Pro")!;
  const office = lisanslar.find((l) => l.urunAdi.startsWith("Microsoft 365"))!;
  const solidworks = lisanslar.find((l) => l.urunAdi.startsWith("SolidWorks"))!;
  const kaspersky = lisanslar.find((l) => l.urunAdi.startsWith("Kaspersky"))!;

  for (const cihaz of bilgisayarlar) {
    await prisma.lisansAtama.create({
      data: {
        lisansId: windows.id,
        cihazId: cihaz.id,
        personelId: cihaz.zimmetliPersonelId,
        atamaTarihi: cihaz.alimTarihi ?? tarih(200),
        aciklama: "Cihazla birlikte kurulum",
      },
    });
    await prisma.lisansAtama.create({
      data: {
        lisansId: kaspersky.id,
        cihazId: cihaz.id,
        personelId: cihaz.zimmetliPersonelId,
        atamaTarihi: cihaz.alimTarihi ?? tarih(200),
      },
    });
  }

  const argeDepartmani = departmanBul("Ar-Ge");
  const argeCihazlari = bilgisayarlar.filter(
    (c) => c.departmanId === argeDepartmani.id,
  );
  for (const cihaz of argeCihazlari.slice(0, solidworks.toplamKoltuk)) {
    await prisma.lisansAtama.create({
      data: {
        lisansId: solidworks.id,
        cihazId: cihaz.id,
        personelId: cihaz.zimmetliPersonelId,
        atamaTarihi: tarih(150),
        aciklama: "Tasarım ekibi kullanımı",
      },
    });
  }

  for (const cihaz of bilgisayarlar.slice(0, office.toplamKoltuk)) {
    await prisma.lisansAtama.create({
      data: {
        lisansId: office.id,
        cihazId: cihaz.id,
        personelId: cihaz.zimmetliPersonelId,
        atamaTarihi: tarih(120),
      },
    });
  }

  const sayimlar = {
    lokasyon: await prisma.lokasyon.count(),
    departman: await prisma.departman.count(),
    personel: await prisma.personel.count(),
    cihaz: await prisma.cihaz.count(),
    lisans: await prisma.lisans.count(),
    lisansAtama: await prisma.lisansAtama.count(),
    zimmetHareketi: await prisma.zimmetHareketi.count(),
  };
  console.log("Örnek veri yüklendi:", sayimlar);
}

main()
  .catch((hata) => {
    console.error("Örnek veri yüklenemedi:", hata);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
