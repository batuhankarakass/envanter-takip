import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js gelistirme modunda modulleri sicak yeniden yukledigi icin
// her yeniden yuklemede yeni bir baglanti havuzu acilmasin diye
// istemci globalThis uzerinde saklanir.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function istemciOlustur() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL tanimli degil. .env dosyasini olusturup ornegin " +
        'DATABASE_URL="file:./dev.db" satirini ekleyin.',
    );
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? istemciOlustur();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
