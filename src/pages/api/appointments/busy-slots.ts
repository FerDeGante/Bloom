// src/pages/api/appointments/busy-slots.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { packageId } = req.query;
  if (!packageId) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // Busca todas las reservaciones activas de ese paquete en los próximos 30 días
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 30);

  const citas = await prisma.reservation.findMany({
    where: {
      packageId: packageId as string,
      date: { gte: today, lte: future },
    },
    select: { date: true },
  });

  // Estructura: [{ date: "YYYY-MM-DD", hour: 9 }, ...]
  const slots = citas.map((c) => {
    const d = new Date(c.date);
    return {
      date: d.toISOString().split("T")[0],
      hour: d.getHours(),
    };
  });

  await prisma.$disconnect();
  return res.status(200).json({ slots });
}