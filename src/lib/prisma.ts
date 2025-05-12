import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiples instancias en dev
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({ log: ["query", "error"] });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
