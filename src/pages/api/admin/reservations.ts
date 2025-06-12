// src/pages/api/admin/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

// Definimos explícitamente el shape del body que esperamos
interface ReservationPayload {
  userId:        string;
  userPackageId: string;
  therapistId:   string;
  date:          string;  // ISO string
  paymentMethod: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Sólo admins
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) Soportamos POST y GET si lo necesitas, aquí centramos POST
  if (req.method === "POST") {
    // 3) Forzamos que TS vea ese campo como siempre string (no undefined)
    const {
      userId,
      userPackageId,
      therapistId,
      date,
      paymentMethod,
    } = req.body as ReservationPayload;

    // 4) Validación de campos obligatorios
    if (
      !userId ||
      !userPackageId ||
      !therapistId ||
      !date ||
      !paymentMethod
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos requeridos para crear la reserva." });
    }

    try {
      // 5) Creamos la reserva
      const reservation = await prisma.reservation.create({
        data: {
          userId,
          userPackageId,          // <--- ya es un string, no undefined
          therapistId,
          date: new Date(date),
          paymentMethod,
        },
      });
      return res.status(201).json(reservation);
    } catch (e) {
      console.error("Error creando reserva:", e);
      return res
        .status(500)
        .json({ error: "Error interno al crear la reservación." });
    }
  }

  // 6) Si necesitas GET, lo dejas aquí; si no, bloquea otros métodos:
  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
