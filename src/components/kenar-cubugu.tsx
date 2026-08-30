"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  { href: "/", etiket: "Panel" },
  { href: "/cihazlar", etiket: "Cihazlar" },
  { href: "/personel", etiket: "Personel" },
  { href: "/lisanslar", etiket: "Lisanslar" },
  { href: "/lokasyonlar", etiket: "Lokasyonlar" },
  { href: "/raporlar", etiket: "Raporlar" },
] as const;

export function KenarCubugu() {
  const yol = usePathname();

  function aktifMi(href: string) {
    if (href === "/") return yol === "/";
    return yol === href || yol.startsWith(href + "/");
  }

  return (
    <aside className="yazdirma-gizle w-full shrink-0 border-b border-line bg-surface md:h-dvh md:w-60 md:border-r md:border-b-0">
      <div className="flex h-full flex-col">
        <div className="border-b border-line px-5 py-4">
          <p className="text-sm font-semibold tracking-tight">
            Envanter Takip
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Cihaz, zimmet ve lisans yönetimi
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:overflow-visible">
          {MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              aria-current={aktifMi(m.href) ? "page" : undefined}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                aktifMi(m.href)
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-background hover:text-foreground"
              }`}
            >
              {m.etiket}
            </Link>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-line px-5 py-4 md:block">
          <p className="text-xs text-muted">
            Örnek verilerle çalışan tanıtım sürümü
          </p>
        </div>
      </div>
    </aside>
  );
}
