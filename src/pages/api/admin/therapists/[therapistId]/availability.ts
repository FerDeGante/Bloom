// src/pages/api/admin/therapists/[therapistId]/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }               from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma                             from "@/lib/prisma";

const ALL_HOURS = [9,10,11,12,13,14,15,16,17,18];

export default async function handler(req: NextApiRequest, res: NextApiResponse<string[] | { error: string }>) {
  // 1) auth + rol
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  // 2) parámetros
  const therapistId = Array.isArray(req.query.therapistId)
    ? req.query.therapistId[0]
    : req.query.therapistId;
  const date = Array.isArray(req.query.date)
    ? req.query.date[0]
    : req.query.date;
  if (req.method !== "GET" || !therapistId || !date) {
    return res.status(400).json({ error: "Missing params" });
  }

  // 3) rango local del día
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(start);
  end.setDate(end.getDate() + 1);

  // 4) sólo traemos la hora de cada reserva
  const reservas = await prisma.reservation.findMany({
    where: { therapistId, date: { gte: start, lt: end } },
    select: { date: true }
  });

  // 5) horas ocupadas
  const ocupadas = new Set(reservas.map(r => r.date.getHours()));

  // 6) filtramos ALL_HOURS
  let libres = ALL_HOURS.filter(h => !ocupadas.has(h));

  // 7) si es hoy, quitamos pasadas
  const hoy = new Date().toISOString().slice(0,10);
  if (date === hoy) {
    const ahora = new Date().getHours();
    libres = libres.filter(h => h > ahora);
  }

  // 8) formateamos y respondemos
  const result = libres.map(h => String(h).padStart(2,"0") + ":00");
  res.status(200).json(result);
}
