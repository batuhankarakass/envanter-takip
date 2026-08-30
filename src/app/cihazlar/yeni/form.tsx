"use client";

import { useActionState } from "react";
import { Buton } from "@/components/arayuz";
import {
  CIHAZ_DURUM_LISTESI,
  CIHAZ_TIP_LISTESI,
  cihazDurumEtiketi,
  cihazTipiEtiketi,
} from "@/lib/sabitler";
import { cihazOlustur, type EylemSonucu } from "../eylemler";

type Secenek = { id: number; ad: string };

const ALAN_SINIFI =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand";

function Alan({
  etiket,
  children,
  genis = false,
}: {
  etiket: string;
  children: React.ReactNode;
  genis?: boolean;
}) {
  return (
    <div className={genis ? "sm:col-span-2" : undefined}>
      <label className="mb-1 block text-xs font-medium text-muted">
        {etiket}
      </label>
      {children}
    </div>
  );
}

export function YeniCihazFormu({
  lokasyonlar,
  departmanlar,
  personeller,
}: {
  lokasyonlar: Secenek[];
  departmanlar: Secenek[];
  personeller: Secenek[];
}) {
  const [durum, eylem, bekliyor] = useActionState<EylemSonucu, FormData>(
    cihazOlustur,
    {},
  );

  return (
    <form action={eylem} className="space-y-5">
      {durum.hata ? (
        <p
          role="alert"
          className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-600/20"
        >
          {durum.hata}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Alan etiket="Envanter kodu *">
          <input
            name="envanterKodu"
            required
            placeholder="Örn. BLG-142"
            className={ALAN_SINIFI}
          />
        </Alan>

        <Alan etiket="Cihaz türü *">
          <select name="tip" required defaultValue="" className={ALAN_SINIFI}>
            <option value="" disabled>
              Seçin
            </option>
            {CIHAZ_TIP_LISTESI.map((t) => (
              <option key={t} value={t}>
                {cihazTipiEtiketi(t)}
              </option>
            ))}
          </select>
        </Alan>

        <Alan etiket="Marka *">
          <input name="marka" required className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Model *">
          <input name="model" required className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Seri numarası">
          <input name="seriNo" className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Durum">
          <select name="durum" defaultValue="DEPODA" className={ALAN_SINIFI}>
            {CIHAZ_DURUM_LISTESI.map((d) => (
              <option key={d} value={d}>
                {cihazDurumEtiketi(d)}
              </option>
            ))}
          </select>
        </Alan>

        <Alan etiket="IP adresi">
          <input
            name="ipAdresi"
            placeholder="10.10.10.25"
            className={ALAN_SINIFI}
          />
        </Alan>

        <Alan etiket="MAC adresi">
          <input
            name="macAdresi"
            placeholder="00:1B:44:11:3A:B7"
            className={ALAN_SINIFI}
          />
        </Alan>

        <Alan etiket="Lokasyon">
          <select name="lokasyonId" defaultValue="" className={ALAN_SINIFI}>
            <option value="">Seçilmedi</option>
            {lokasyonlar.map((l) => (
              <option key={l.id} value={l.id}>
                {l.ad}
              </option>
            ))}
          </select>
        </Alan>

        <Alan etiket="Departman">
          <select name="departmanId" defaultValue="" className={ALAN_SINIFI}>
            <option value="">Seçilmedi</option>
            {departmanlar.map((d) => (
              <option key={d.id} value={d.id}>
                {d.ad}
              </option>
            ))}
          </select>
        </Alan>

        <Alan etiket="Zimmetlenecek personel" genis>
          <select
            name="zimmetliPersonelId"
            defaultValue=""
            className={ALAN_SINIFI}
          >
            <option value="">Seçilmedi</option>
            {personeller.map((p) => (
              <option key={p.id} value={p.id}>
                {p.ad}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Durum &quot;Zimmetli&quot; seçildiyse personel seçilmesi zorunludur.
          </p>
        </Alan>

        <Alan etiket="Alım tarihi">
          <input type="date" name="alimTarihi" className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Garanti bitişi">
          <input type="date" name="garantiBitis" className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Sonraki bakım">
          <input type="date" name="sonrakiBakim" className={ALAN_SINIFI} />
        </Alan>

        <Alan etiket="Notlar" genis>
          <textarea name="notlar" rows={3} className={ALAN_SINIFI} />
        </Alan>
      </div>

      <div className="flex gap-2">
        <Buton type="submit" tur="birincil">
          {bekliyor ? "Kaydediliyor…" : "Cihazı kaydet"}
        </Buton>
        <Buton href="/cihazlar">Vazgeç</Buton>
      </div>
    </form>
  );
}
