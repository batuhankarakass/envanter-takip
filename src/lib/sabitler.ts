// SQLite enum tipini desteklemedigi icin durum/tip alanlari veritabaninda
// String tutulur. Gecerli degerler ve ekranda gorunen Turkce karsiliklari
// tek kaynak olarak burada tanimlidir.

export const CIHAZ_TIPLERI = {
  DIZUSTU: "Dizüstü bilgisayar",
  MASAUSTU: "Masaüstü bilgisayar",
  SUNUCU: "Sunucu",
  MONITOR: "Monitör",
  YAZICI: "Yazıcı",
  KAMERA: "IP kamera",
  AG_CIHAZI: "Ağ cihazı",
  CNC: "CNC tezgâhı",
  TELEFON: "Telefon",
  DIGER: "Diğer",
} as const;

export const CIHAZ_DURUMLARI = {
  ZIMMETLI: "Zimmetli",
  DEPODA: "Depoda",
  BAKIMDA: "Bakımda",
  HURDA: "Hurda",
} as const;

export const LISANS_TIPLERI = {
  OEM: "OEM",
  RETAIL: "Perakende",
  VOLUME: "Toplu lisans",
  ABONELIK: "Abonelik",
} as const;

export const ZIMMET_HAREKET_TIPLERI = {
  ZIMMET: "Zimmet verildi",
  IADE: "İade alındı",
  TRANSFER: "Transfer edildi",
} as const;

export type CihazTipi = keyof typeof CIHAZ_TIPLERI;
export type CihazDurumu = keyof typeof CIHAZ_DURUMLARI;
export type LisansTipi = keyof typeof LISANS_TIPLERI;
export type ZimmetHareketTipi = keyof typeof ZIMMET_HAREKET_TIPLERI;

export const CIHAZ_TIP_LISTESI = Object.keys(CIHAZ_TIPLERI) as CihazTipi[];
export const CIHAZ_DURUM_LISTESI = Object.keys(CIHAZ_DURUMLARI) as CihazDurumu[];
export const LISANS_TIP_LISTESI = Object.keys(LISANS_TIPLERI) as LisansTipi[];

export function cihazTipiEtiketi(tip: string) {
  return CIHAZ_TIPLERI[tip as CihazTipi] ?? tip;
}

export function cihazDurumEtiketi(durum: string) {
  return CIHAZ_DURUMLARI[durum as CihazDurumu] ?? durum;
}

export function lisansTipiEtiketi(tip: string) {
  return LISANS_TIPLERI[tip as LisansTipi] ?? tip;
}

export function zimmetHareketEtiketi(tip: string) {
  return ZIMMET_HAREKET_TIPLERI[tip as ZimmetHareketTipi] ?? tip;
}

/// Durum rozetlerinin renk siniflari (Tailwind)
export const DURUM_RENKLERI: Record<string, string> = {
  ZIMMETLI: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  DEPODA: "bg-slate-50 text-slate-600 ring-slate-500/20",
  BAKIMDA: "bg-amber-50 text-amber-700 ring-amber-600/20",
  HURDA: "bg-rose-50 text-rose-700 ring-rose-600/20",
};
