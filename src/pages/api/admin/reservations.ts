// src/pages/api/admin/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "../auth/[...nextauth]";
import prisma               from "@/lib/prisma";

// 1) Definimos explícitamente los campos que esperamos en el body
interface ReservationPayload {
  userId:        string;
  userPackageId: string;
  serviceId:     string;   // <-- agregado
  therapistId:   string;
  date:          string;   // ISO string
  paymentMethod: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 2) Sólo ADMIN puede
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 3) Solo POST para crear reserva
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 4) Forzamos el tipo del body
  const {
    userId,
    userPackageId,
    serviceId,       // <-- aquí lo leemos
    therapistId,
    date,
    paymentMethod,
  } = req.body as ReservationPayload;

  // 5) Validamos que todos los campos estén presentes
  if (
    !userId ||
    !userPackageId ||
    !serviceId ||      // <-- validamos también serviceId
    !therapistId ||
    !date ||
    !paymentMethod
  ) {
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos para crear la reserva." });
  }

  try {
    // 6) Creamos la reserva con serviceId incluido
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        userPackageId,
        serviceId,       // <-- aquí lo pasamos a Prisma
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
