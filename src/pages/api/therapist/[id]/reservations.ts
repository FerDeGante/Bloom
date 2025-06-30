// src/pages/api/therapist/[id]/reservations.ts

import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    await prisma.$disconnect();
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Trae todas las reservaciones del sistema (puedes filtrar por fecha si lo requieres)
  const reservations = await prisma.reservation.findMany({
    // Si quieres filtrar solo por terapeuta:
    // where: { therapistId: id as string },
    include: {
      user:     { select: { name: true } },
      package:  { select: { name: true, sessions: true } },
      therapist:{ include: { user: { select: { name: true } } } }
    },
    orderBy: { date: "asc" },
  });

  // Agrupa por usuario y paquete, y ordena por fecha SOLO UNA VEZ
  const grouped: Record<string, typeof reservations> = {};
  reservations.forEach(r => {
    const key = `${r.userId}-${r.packageId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.date.getTime() - b.date.getTime()));

  // Mapea con el número de sesión correcto
  const mapped = reservations.map(r => {
    const key = `${r.userId}-${r.packageId}`;
    const sessionNumber = grouped[key].findIndex(x => x.id === r.id) + 1;
    return {
      id:             r.id,
      date:           r.date,
      userName:       r.user?.name ?? "",
      serviceName:    r.package?.name ?? "",
      therapistName:  r.therapist?.user?.name ?? "",
      sessionNumber,
      totalSessions:  r.package?.sessions ?? 1,
      paymentMethod:  r.paymentMethod,
    };
  });

  res.status(200).json(mapped);
  await prisma.$disconnect();
}