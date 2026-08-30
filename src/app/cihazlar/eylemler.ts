"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CIHAZ_DURUM_LISTESI, CIHAZ_TIP_LISTESI } from "@/lib/sabitler";

/** Form alanini metne cevirir; bos ise null doner. */
function metin(form: FormData, alan: string) {
  const deger = form.get(alan);
  if (typeof deger !== "string") return null;
  const kirpilmis = deger.trim();
  return kirpilmis.length > 0 ? kirpilmis : null;
}

function sayi(form: FormData, alan: string) {
  const deger = metin(form, alan);
  if (deger === null) return null;
  const n = Number(deger);
  return Number.isFinite(n) ? n : null;
}

function tarih(form: FormData, alan: string) {
  const deger = metin(form, alan);
  if (deger === null) return null;
  const t = new Date(deger);
  return Number.isNaN(t.getTime()) ? null : t;
}

export type EylemSonucu = { hata?: string };

export async function cihazOlustur(
  _oncekiDurum: EylemSonucu,
  form: FormData,
): Promise<EylemSonucu> {
  const envanterKodu = metin(form, "envanterKodu");
  const marka = metin(form, "marka");
  const model = metin(form, "model");
  const tip = metin(form, "tip");
  const durum = metin(form, "durum") ?? "DEPODA";

  if (!envanterKodu) return { hata: "Envanter kodu zorunludur." };
  if (!marka) return { hata: "Marka zorunludur." };
  if (!model) return { hata: "Model zorunludur." };
  if (!tip || !CIHAZ_TIP_LISTESI.includes(tip as never)) {
    return { hata: "Geçerli bir cihaz türü seçin." };
  }
  if (!CIHAZ_DURUM_LISTESI.includes(durum as never)) {
    return { hata: "Geçerli bir durum seçin." };
  }

  const mevcut = await prisma.cihaz.findUnique({ where: { envanterKodu } });
  if (mevcut) {
    return { hata: `"${envanterKodu}" envanter kodu zaten kayıtlı.` };
  }

  const zimmetliPersonelId = sayi(form, "zimmetliPersonelId");
  if (durum === "ZIMMETLI" && !zimmetliPersonelId) {
    return { hata: "Zimmetli durumu için personel seçmelisiniz." };
  }

  const cihaz = await prisma.cihaz.create({
    data: {
      envanterKodu,
      marka,
      model,
      tip,
      durum,
      seriNo: metin(form, "seriNo"),
      ipAdresi: metin(form, "ipAdresi"),
      macAdresi: metin(form, "macAdresi"),
      notlar: metin(form, "notlar"),
      alimTarihi: tarih(form, "alimTarihi"),
      garantiBitis: tarih(form, "garantiBitis"),
      sonrakiBakim: tarih(form, "sonrakiBakim"),
      lokasyonId: sayi(form, "lokasyonId"),
      departmanId: sayi(form, "departmanId"),
      zimmetliPersonelId: durum === "ZIMMETLI" ? zimmetliPersonelId : null,
    },
  });

  if (durum === "ZIMMETLI" && zimmetliPersonelId) {
    await prisma.zimmetHareketi.create({
      data: {
        cihazId: cihaz.id,
        personelId: zimmetliPersonelId,
        tip: "ZIMMET",
        aciklama: "Cihaz kaydı oluşturulurken zimmetlendi",
      },
    });
  }

  revalidatePath("/cihazlar");
  revalidatePath("/");
  redirect(`/cihazlar/${cihaz.id}`);
}

export async function zimmetVer(form: FormData) {
  const cihazId = sayi(form, "cihazId");
  const personelId = sayi(form, "personelId");
  if (!cihazId || !personelId) return;

  const cihaz = await prisma.cihaz.findUnique({ where: { id: cihazId } });
  if (!cihaz) return;

  const personel = await prisma.personel.findUnique({
    where: { id: personelId },
    include: { lokasyon: true },
  });
  if (!personel) return;

  await prisma.$transaction([
    prisma.cihaz.update({
      where: { id: cihazId },
      data: {
        zimmetliPersonelId: personelId,
        durum: "ZIMMETLI",
        // Cihaz, zimmetlendigi personelin lokasyon ve departmanina tasinir.
        lokasyonId: personel.lokasyonId ?? cihaz.lokasyonId,
        departmanId: personel.departmanId ?? cihaz.departmanId,
      },
    }),
    prisma.zimmetHareketi.create({
      data: {
        cihazId,
        personelId,
        tip: cihaz.zimmetliPersonelId ? "TRANSFER" : "ZIMMET",
        aciklama: metin(form, "aciklama"),
      },
    }),
  ]);

  revalidatePath(`/cihazlar/${cihazId}`);
  revalidatePath("/cihazlar");
  revalidatePath("/");
}

export async function zimmetIadeAl(form: FormData) {
  const cihazId = sayi(form, "cihazId");
  if (!cihazId) return;

  const cihaz = await prisma.cihaz.findUnique({ where: { id: cihazId } });
  if (!cihaz || !cihaz.zimmetliPersonelId) return;

  await prisma.$transaction([
    prisma.cihaz.update({
      where: { id: cihazId },
      data: { zimmetliPersonelId: null, durum: "DEPODA" },
    }),
    prisma.zimmetHareketi.create({
      data: {
        cihazId,
        personelId: cihaz.zimmetliPersonelId,
        tip: "IADE",
        aciklama: metin(form, "aciklama") ?? "Cihaz depoya iade alındı",
      },
    }),
  ]);

  revalidatePath(`/cihazlar/${cihazId}`);
  revalidatePath("/cihazlar");
  revalidatePath("/");
}

export async function durumGuncelle(form: FormData) {
  const cihazId = sayi(form, "cihazId");
  const durum = metin(form, "durum");
  if (!cihazId || !durum) return;
  if (!CIHAZ_DURUM_LISTESI.includes(durum as never)) return;

  // Zimmetli disina cikan cihazin zimmeti otomatik dusulur.
  const zimmetiKaldir = durum !== "ZIMMETLI";

  await prisma.cihaz.update({
    where: { id: cihazId },
    data: {
      durum,
      ...(zimmetiKaldir ? { zimmetliPersonelId: null } : {}),
    },
  });

  revalidatePath(`/cihazlar/${cihazId}`);
  revalidatePath("/cihazlar");
  revalidatePath("/");
}
