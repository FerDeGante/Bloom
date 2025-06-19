// src/pages/api/admin/therapists/[therapistId]/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Ajusta la import si usas default export

const ALL_HOURS = [9,10,11,12,13,14,15,16,17,18];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const therapistId = Array.isArray(req.query.therapistId)
    ? req.query.therapistId[0]
    : req.query.therapistId;
  const date = Array.isArray(req.query.date)
    ? req.query.date[0]
    : req.query.date;

  if (req.method !== "GET" || !therapistId || !date) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Missing params" });
  }

  // Buscamos reservas para ese terapeuta y día (horario local)
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(start);
  end.setDate(end.getDate() + 1);

  const reservas = await prisma.reservation.findMany({
    where: {
      therapistId,
      date: { gte: start, lt: end },
    },
  });

  const ocupadas = new Set(reservas.map(r => new Date(r.date).getHours()));

  // Filtramos todas las horas posibles
  let libres = ALL_HOURS.filter(h => !ocupadas.has(h));

  // Filtrar horas pasadas en zona local si es hoy
  const hoy = new Date().toISOString().slice(0,10);
  if (date === hoy) {
    const ahora = new Date().getHours();
    libres = libres.filter(h => h > ahora);
  }

  // Devolvemos ["09:00","10:00",...]
  const result = libres.map(h => String(h).padStart(2,"0") + ":00");
  res.status(200).json(result);
  await prisma.$disconnect();
}
