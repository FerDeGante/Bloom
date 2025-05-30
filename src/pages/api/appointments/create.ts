// ✅ Archivo: src/pages/api/appointments/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { servicio, terapeuta, date, hour } = req.body as {
    servicio: string;
    terapeuta: string;
    date: string;
    hour: string;
  };

  const svc = await prisma.service.findUnique({ where: { id: servicio } });
  const ther = await prisma.therapist.findFirst({ where: { name: terapeuta } });
  if (!svc || !ther) return res.status(400).json({ error: "Servicio o terapeuta inválido" });

  const datetime = new Date(`${date}T${hour}:00`);

  // ✅ Buscar paquete activo (vigente y con sesiones disponibles)
  const userPkg = await prisma.userPackage.findFirst({
    where: {
      userId: session.user.id,
      sessionsRemaining: { gt: 0 },
    },
    include: { pkg: true },
    orderBy: { createdAt: "desc" },
  });

  if (!userPkg) return res.status(400).json({ error: "No tienes paquetes activos" });

  const expires = new Date(userPkg.createdAt);
  expires.setDate(expires.getDate() + userPkg.pkg.inscription);
  if (datetime > expires) return res.status(400).json({ error: "Tu paquete ha expirado" });

  // ✅ Candado por semana: no más de X sesiones por semana
  const sesionesPorSemana = userPkg.pkg.sessions / 4; // 4 semanas en promedio por mes
  const startOfWeek = new Date(datetime);
  startOfWeek.setDate(datetime.getDate() - datetime.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const citasEstaSemana = await prisma.reservation.count({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
    },
  });

  if (citasEstaSemana >= sesionesPorSemana) {
    return res.status(400).json({ error: `Tu paquete solo permite ${sesionesPorSemana} sesiones por semana.` });
  }

  // ✅ Crear reservación y restar sesión
  await prisma.$transaction([
    prisma.reservation.create({
      data: {
        userId: session.user.id,
        serviceId: svc.id,
        therapistId: ther.id,
        date: datetime,
      },
    }),
    prisma.userPackage.update({
      where: { id: userPkg.id },
      data: { sessionsRemaining: { decrement: 1 } },
    }),
  ]);

  res.status(200).json({ ok: true });
}
