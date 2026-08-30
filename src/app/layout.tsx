import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { KenarCubugu } from "@/components/kenar-cubugu";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Envanter ve Zimmet Takip Sistemi",
  description:
    "Kurum içi bilişim envanteri, zimmet hareketleri ve yazılım lisanslarının takibi için web tabanlı yönetim uygulaması.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-dvh flex-col md:flex-row">
          <KenarCubugu />
          <main className="yazdirma-tam flex-1 px-5 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
