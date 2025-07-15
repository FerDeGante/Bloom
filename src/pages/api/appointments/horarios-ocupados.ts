// src/pages/api/appointments/horarios-ocupados.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    await prisma.$disconnect();
    return res.status(405).end("Method Not Allowed");
  }

  const { date, packageId, therapistId } = req.query;
  if (!date || (!packageId && !therapistId)) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const day = new Date(Array.isArray(date) ? date[0] : date);
  const start = new Date(day); start.setHours(0, 0, 0, 0);
  const end = new Date(day); end.setHours(23, 59, 59, 999);

  // Puedes buscar por packageId o por therapistId según tu lógica
  const where: any = {
    date: { gte: start, lte: end },
  };
  if (packageId) where.packageId = packageId as string;
  if (therapistId) where.therapistId = therapistId as string;

  const citas = await prisma.reservation.findMany({
    where,
    select: { date: true },
  });

  const horasOcupadas = citas.map((c) => new Date(c.date).getHours());

  await prisma.$disconnect();
  return res.status(200).json({ horas: horasOcupadas });
}