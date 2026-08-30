-- CreateTable
CREATE TABLE "Lokasyon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "bina" TEXT,
    "kat" TEXT,
    "aciklama" TEXT,
    "olusturma" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Departman" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ad" TEXT NOT NULL,
    "kod" TEXT,
    "aciklama" TEXT,
    "olusturma" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Personel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sicilNo" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "eposta" TEXT,
    "telefon" TEXT,
    "unvan" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "iseGirisTarihi" DATETIME,
    "departmanId" INTEGER,
    "lokasyonId" INTEGER,
    "olusturma" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" DATETIME NOT NULL,
    CONSTRAINT "Personel_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Personel_lokasyonId_fkey" FOREIGN KEY ("lokasyonId") REFERENCES "Lokasyon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cihaz" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "envanterKodu" TEXT NOT NULL,
    "tip" TEXT NOT NULL,
    "marka" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "seriNo" TEXT,
    "ipAdresi" TEXT,
    "macAdresi" TEXT,
    "durum" TEXT NOT NULL DEFAULT 'DEPODA',
    "alimTarihi" DATETIME,
    "garantiBitis" DATETIME,
    "sonBakimTarihi" DATETIME,
    "sonrakiBakim" DATETIME,
    "notlar" TEXT,
    "departmanId" INTEGER,
    "lokasyonId" INTEGER,
    "zimmetliPersonelId" INTEGER,
    "olusturma" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" DATETIME NOT NULL,
    CONSTRAINT "Cihaz_departmanId_fkey" FOREIGN KEY ("departmanId") REFERENCES "Departman" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cihaz_lokasyonId_fkey" FOREIGN KEY ("lokasyonId") REFERENCES "Lokasyon" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cihaz_zimmetliPersonelId_fkey" FOREIGN KEY ("zimmetliPersonelId") REFERENCES "Personel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lisans" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "urunAdi" TEXT NOT NULL,
    "uretici" TEXT NOT NULL,
    "surum" TEXT,
    "lisansAnahtari" TEXT,
    "tip" TEXT NOT NULL DEFAULT 'RETAIL',
    "toplamKoltuk" INTEGER NOT NULL DEFAULT 1,
    "baslangicTarihi" DATETIME,
    "bitisTarihi" DATETIME,
    "satinAlmaBedeli" REAL,
    "paraBirimi" TEXT DEFAULT 'TRY',
    "notlar" TEXT,
    "olusturma" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guncelleme" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LisansAtama" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lisansId" INTEGER NOT NULL,
    "cihazId" INTEGER,
    "personelId" INTEGER,
    "atamaTarihi" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kaldirmaTarihi" DATETIME,
    "aciklama" TEXT,
    CONSTRAINT "LisansAtama_lisansId_fkey" FOREIGN KEY ("lisansId") REFERENCES "Lisans" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LisansAtama_cihazId_fkey" FOREIGN KEY ("cihazId") REFERENCES "Cihaz" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "LisansAtama_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "Personel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ZimmetHareketi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cihazId" INTEGER NOT NULL,
    "personelId" INTEGER,
    "tip" TEXT NOT NULL,
    "tarih" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aciklama" TEXT,
    CONSTRAINT "ZimmetHareketi_cihazId_fkey" FOREIGN KEY ("cihazId") REFERENCES "Cihaz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ZimmetHareketi_personelId_fkey" FOREIGN KEY ("personelId") REFERENCES "Personel" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lokasyon_ad_key" ON "Lokasyon"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Departman_ad_key" ON "Departman"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Departman_kod_key" ON "Departman"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Personel_sicilNo_key" ON "Personel"("sicilNo");

-- CreateIndex
CREATE UNIQUE INDEX "Personel_eposta_key" ON "Personel"("eposta");

-- CreateIndex
CREATE INDEX "Personel_departmanId_idx" ON "Personel"("departmanId");

-- CreateIndex
CREATE INDEX "Personel_lokasyonId_idx" ON "Personel"("lokasyonId");

-- CreateIndex
CREATE INDEX "Personel_aktif_idx" ON "Personel"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "Cihaz_envanterKodu_key" ON "Cihaz"("envanterKodu");

-- CreateIndex
CREATE UNIQUE INDEX "Cihaz_seriNo_key" ON "Cihaz"("seriNo");

-- CreateIndex
CREATE INDEX "Cihaz_durum_idx" ON "Cihaz"("durum");

-- CreateIndex
CREATE INDEX "Cihaz_tip_idx" ON "Cihaz"("tip");

-- CreateIndex
CREATE INDEX "Cihaz_lokasyonId_idx" ON "Cihaz"("lokasyonId");

-- CreateIndex
CREATE INDEX "Cihaz_departmanId_idx" ON "Cihaz"("departmanId");

-- CreateIndex
CREATE INDEX "Cihaz_zimmetliPersonelId_idx" ON "Cihaz"("zimmetliPersonelId");

-- CreateIndex
CREATE INDEX "Cihaz_sonrakiBakim_idx" ON "Cihaz"("sonrakiBakim");

-- CreateIndex
CREATE UNIQUE INDEX "Lisans_lisansAnahtari_key" ON "Lisans"("lisansAnahtari");

-- CreateIndex
CREATE INDEX "Lisans_uretici_idx" ON "Lisans"("uretici");

-- CreateIndex
CREATE INDEX "Lisans_bitisTarihi_idx" ON "Lisans"("bitisTarihi");

-- CreateIndex
CREATE INDEX "LisansAtama_lisansId_idx" ON "LisansAtama"("lisansId");

-- CreateIndex
CREATE INDEX "LisansAtama_cihazId_idx" ON "LisansAtama"("cihazId");

-- CreateIndex
CREATE INDEX "LisansAtama_personelId_idx" ON "LisansAtama"("personelId");

-- CreateIndex
CREATE INDEX "ZimmetHareketi_cihazId_idx" ON "ZimmetHareketi"("cihazId");

-- CreateIndex
CREATE INDEX "ZimmetHareketi_personelId_idx" ON "ZimmetHareketi"("personelId");

-- CreateIndex
CREATE INDEX "ZimmetHareketi_tarih_idx" ON "ZimmetHareketi"("tarih");
