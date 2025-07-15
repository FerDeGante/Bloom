// src/pages/api/appointments/create.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    await prisma.$disconnect();
    return res.status(405).end("Method Not Allowed");
  }

  // Autenticación
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).end("Unauthorized");
  }

  const { paquete, terapeuta, branchId, date, hour } = req.body as {
    paquete: string;
    terapeuta: string;
    branchId: string;
    date: string; // "YYYY-MM-DD"
    hour: string; // "HH:mm"
  };

  if (!paquete || !terapeuta || !branchId || !date || !hour) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  const pkg = await prisma.package.findUnique({ where: { id: paquete } });
  const ther = await prisma.therapist.findFirst({
    where: { user: { name: terapeuta } },
    include: { user: { select: { name: true } } },
  });

  if (!pkg || !ther) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Paquete o terapeuta inválido" });
  }

  const datetime = new Date(`${date}T${hour}:00`);

  // 1) Checa si YA hay reservación a esa hora con ese paquete y usuario (no dobles)
  const existe = await prisma.reservation.findFirst({
    where: {
      userId: session.user.id,
      packageId: pkg.id,
      date: datetime,
    }
  });
  if (existe) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Ya tienes una reservación a esa hora con este paquete." });
  }

  // 2) Lógica de sesiones por semana según paquete
  let sesionesPorSemana = 1;
  if (pkg.sessions === 4) sesionesPorSemana = 1;
  else if (pkg.sessions === 8) sesionesPorSemana = 2;
  else if (pkg.sessions === 12) sesionesPorSemana = 3;
  else if (pkg.sessions === 5) sesionesPorSemana = 1;
  else if (pkg.sessions === 10) sesionesPorSemana = 2;

  // Calcula semana
  const startOfWeek = new Date(datetime);
  startOfWeek.setDate(datetime.getDate() - datetime.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // ¿Ya tiene sesiones esta semana?
  const citasEstaSemana = await prisma.reservation.count({
    where: {
      userId: session.user.id,
      packageId: pkg.id,
      date: { gte: startOfWeek, lt: endOfWeek },
    },
  });
  if (citasEstaSemana >= sesionesPorSemana) {
    await prisma.$disconnect();
    return res.status(400).json({
      error: `Solo puedes reservar ${sesionesPorSemana} sesión(es) por semana con este paquete.`,
    });
  }

  // 3) Obtener paquete activo
  const userPkg = await prisma.userPackage.findFirst({
    where: {
      userId: session.user.id,
      packageId: pkg.id,
      sessionsRemaining: { gt: 0 },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!userPkg) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "No tienes paquetes activos de ese tipo" });
  }

  // 4) Checa expiración
  const expires = new Date(userPkg.createdAt);
  expires.setDate(expires.getDate() + pkg.inscription);
  if (datetime > expires) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Tu paquete ha expirado" });
  }

  // 5) Crea reservación y descuenta sesión
  try {
    await prisma.$transaction([
      prisma.reservation.create({
        data: {
          userId: session.user.id,
          packageId: pkg.id,
          therapistId: ther.id,
          branchId,
          date: datetime,
          userPackageId: userPkg.id,
          paymentMethod: "stripe",
        },
      }),
      prisma.userPackage.update({
        where: { id: userPkg.id },
        data: { sessionsRemaining: { decrement: 1 } },
      }),
    ]);
    await prisma.$disconnect();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error creando cita:", err);
    await prisma.$disconnect();
    return res.status(500).json({ error: "Error interno al crear la cita." });
  }
}