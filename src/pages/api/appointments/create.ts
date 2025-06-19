// src/pages/api/appointments/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Solo soportamos POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    const na = res.status(405).end("Method Not Allowed");
    await prisma.$disconnect();
    return na;
  }

  // 2) Autenticación
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).end("Unauthorized");
  }

  // 3) Lectura y validación del body
  const { servicio, terapeuta, date, hour } = req.body as {
    servicio:  string;
    terapeuta: string;
    date:      string; // "YYYY-MM-DD"
    hour:      string; // "HH:mm"
  };

  if (!servicio || !terapeuta || !date || !hour) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Faltan campos requeridos" });
  }

  // 4) Búsqueda de servicio y terapeuta
  const svc = await prisma.service.findUnique({ where: { id: servicio } });
  const ther = await prisma.therapist.findFirst({ where: { name: terapeuta } });
  if (!svc || !ther) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Servicio o terapeuta inválido" });
  }

  const datetime = new Date(`${date}T${hour}:00`);

  // 5) Obtener paquete activo del usuario
  const userPkg = await prisma.userPackage.findFirst({
    where: {
      userId: session.user.id,
      sessionsRemaining: { gt: 0 },
    },
    include: { pkg: true },
    orderBy: { createdAt: "desc" },
  });
  if (!userPkg) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "No tienes paquetes activos" });
  }

  // 6) Validar expiración del paquete
  const expires = new Date(userPkg.createdAt);
  expires.setDate(expires.getDate() + userPkg.pkg.inscription);
  if (datetime > expires) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Tu paquete ha expirado" });
  }

  // 7) Restricción de sesiones por semana
  const sesionesPorSemana = userPkg.pkg.sessions / 4;
  const startOfWeek = new Date(datetime);
  startOfWeek.setDate(datetime.getDate() - datetime.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const citasEstaSemana = await prisma.reservation.count({
    where: {
      userId: session.user.id,
      date: { gte: startOfWeek, lt: endOfWeek },
    },
  });
  if (citasEstaSemana >= sesionesPorSemana) {
    await prisma.$disconnect();
    return res
      .status(400)
      .json({ error: `Solo puedes ${sesionesPorSemana} sesiones por semana.` });
  }

  // 8) Crear reserva y decrementar sesionesRemaining
  try {
    await prisma.$transaction([
      prisma.reservation.create({
        data: {
          userId:        session.user.id,
          serviceId:     svc.id,
          therapistId:   ther.id,
          date:          datetime,
          userPackageId: userPkg.id,         // <--- Agregado
          paymentMethod: "stripe",           // o "en sucursal", según tu flujo
        },
      }),
      prisma.userPackage.update({
        where: { id: userPkg.id },
        data: { sessionsRemaining: { decrement: 1 } },
      }),
    ]);
    const ok = res.status(200).json({ ok: true });
    await prisma.$disconnect();
    return ok;
  } catch (err) {
    console.error("Error creando cita:", err);
    const errRes = res.status(500).json({ error: "Error interno al crear la cita." });
    await prisma.$disconnect();
    return errRes;
  }
}