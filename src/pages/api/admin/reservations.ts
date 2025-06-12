// src/pages/api/admin/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Asegurar sesión + rol ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) GET /api/admin/reservations?date=YYYY-MM-DD
  if (req.method === "GET") {
    const { date } = req.query as { date?: string };
    if (!date) {
      return res.status(400).json({ error: "Se requiere fecha (YYYY-MM-DD)" });
    }
    // rango día completo
    const from = new Date(date);
    from.setHours(0, 0, 0, 0);
    const to = new Date(date);
    to.setHours(23, 59, 59, 999);

    const existing: {
      id: string;
      date: Date;
      therapistId: string;
      serviceId: string;
      userPackageId: string;
    }[] = await prisma.reservation.findMany({
      where: { date: { gte: from, lte: to } },
      select: { id: true, date: true, therapistId: true, serviceId: true, userPackageId: true },
    });

    return res.status(200).json(existing);
  }

  // 3) POST /api/admin/reservations  → crear nueva reserva
  if (req.method === "POST") {
    const { userId, userPackageId, serviceId, therapistId, date, paymentMethod } =
      req.body as {
        userId: string;
        userPackageId: string;
        serviceId: string;
        therapistId: string;
        date: string;            // ISO
        paymentMethod: string;
      };

    if (
      !userId ||
      !userPackageId ||
      !serviceId ||
      !therapistId ||
      !date ||
      !paymentMethod
    ) {
      return res.status(400)
        .json({ error: "Faltan campos: userId, userPackageId, serviceId, therapistId, date o paymentMethod." });
    }

    try {
      const r = await prisma.reservation.create({
        data: {
          userId,
          userPackageId,
          serviceId,
          therapistId,
          date: new Date(date),
          paymentMethod,
        },
      });
      return res.status(201).json(r);
    } catch (e) {
      console.error("Error creando reserva:", e);
      return res.status(500).json({ error: "Error interno al crear la reserva." });
    }
  }

  // 4) Métodos no soportados
  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end("Method Not Allowed");
}