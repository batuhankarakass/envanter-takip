import Link from "next/link";
import type { ReactNode } from "react";

/** Sayfa basligi ve isteğe bagli sag taraf eylemleri */
export function SayfaBasligi({
  baslik,
  aciklama,
  eylem,
}: {
  baslik: string;
  aciklama?: string;
  eylem?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {baslik}
        </h1>
        {aciklama ? (
          <p className="mt-1 text-sm text-muted">{aciklama}</p>
        ) : null}
      </div>
      {eylem ? <div className="flex gap-2">{eylem}</div> : null}
    </div>
  );
}

export function Kart({
  baslik,
  ustBilgi,
  children,
  className = "",
}: {
  baslik?: string;
  ustBilgi?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-surface ${className}`}
    >
      {baslik || ustBilgi ? (
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          {baslik ? (
            <h2 className="text-sm font-semibold text-foreground">
              {baslik}
            </h2>
          ) : (
            <span />
          )}
          {ustBilgi}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** Panel ustundeki sayisal ozet kutusu */
export function OzetKutusu({
  etiket,
  deger,
  altBilgi,
  href,
}: {
  etiket: string;
  deger: number | string;
  altBilgi?: string;
  href?: string;
}) {
  const icerik = (
    <div className="rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {etiket}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{deger}</p>
      {altBilgi ? (
        <p className="mt-1 text-xs text-muted">{altBilgi}</p>
      ) : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {icerik}
    </Link>
  ) : (
    icerik
  );
}

export function Rozet({
  children,
  renk = "bg-slate-50 text-slate-600 ring-slate-500/20",
}: {
  children: ReactNode;
  renk?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${renk}`}
    >
      {children}
    </span>
  );
}

export function BosDurum({ mesaj }: { mesaj: string }) {
  return (
    <p className="px-2 py-10 text-center text-sm text-muted">
      {mesaj}
    </p>
  );
}

export function Buton({
  href,
  children,
  tur = "ikincil",
  type,
}: {
  href?: string;
  children: ReactNode;
  tur?: "birincil" | "ikincil";
  type?: "submit" | "button";
}) {
  const sinif =
    tur === "birincil"
      ? "bg-brand text-white hover:opacity-90"
      : "border border-line bg-surface text-foreground hover:border-brand";
  const ortak = `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${sinif}`;

  if (href) {
    return (
      <Link href={href} className={ortak}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type ?? "button"} className={ortak}>
      {children}
    </button>
  );
}

/** Anahtar-deger listesi (detay sayfalarinda kullanilir) */
export function BilgiSatiri({
  etiket,
  children,
}: {
  etiket: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-line py-2.5 last:border-0">
      <dt className="text-sm text-muted">{etiket}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
