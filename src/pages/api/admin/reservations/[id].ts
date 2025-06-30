import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

// PATCH /api/admin/reservations/:id
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { id } = req.query;

  if (req.method === "PATCH") {
    const { newDate, newTime } = req.body as {
      newDate: string; // 'YYYY-MM-DD'
      newTime: string; // 'HH:mm'
    };

    if (!newDate || !newTime) {
      return res.status(400).json({ error: "Datos incompletos." });
    }

    // 1. Buscar la reservación existente
    const reservation = await prisma.reservation.findUnique({
      where: { id: String(id) },
      include: { package: true, user: true, branch: true }
    });
    if (!reservation) {
      return res.status(404).json({ error: "Reservación no encontrada." });
    }

    // 2. Verificar vigencia del paquete (ejemplo: 30 días desde la primera sesión)
    let userPackageId = reservation.userPackageId;
    let firstSessionDate = reservation.date;
    if (userPackageId) {
      const primeras = await prisma.reservation.findMany({
        where: { userPackageId },
        orderBy: { date: "asc" },
        take: 1,
      });
      if (primeras.length > 0) firstSessionDate = primeras[0].date;
    }
    // Validación 30 días
    const minDate = new Date(firstSessionDate);
    const maxDate = new Date(firstSessionDate);
    maxDate.setDate(maxDate.getDate() + 29);
    const newDateObj = new Date(newDate + "T" + newTime);

    if (newDateObj < minDate || newDateObj > maxDate) {
      return res.status(400).json({ error: "La nueva fecha debe estar dentro de la vigencia del paquete (30 días)." });
    }

    // 3. Validar disponibilidad/aforo
    let maxPerSlot = 1;
    let slotWhere: any = {
      date: newDateObj,
      branchId: reservation.branchId,
    };
    if (/agua/i.test(reservation.package.name) || /piso/i.test(reservation.package.name)) {
      slotWhere.packageId = reservation.packageId;
      maxPerSlot = 3;
    }

    // Excluye la reservación actual (para que no bloquee su propio horario)
    const slotCount = await prisma.reservation.count({
      where: {
        ...slotWhere,
        id: { not: reservation.id }
      }
    });

    if (slotCount >= maxPerSlot) {
      return res.status(409).json({ error: "Horario no disponible para este paquete." });
    }

    // 4. Actualizar la reservación
    try {
      const updated = await prisma.reservation.update({
        where: { id: String(id) },
        data: { date: newDateObj }
      });

      return res.status(200).json({
        id: updated.id,
        date: updated.date.toISOString(),
        message: "Reservación actualizada correctamente.",
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Error al actualizar la reservación." });
    }
  }

  res.setHeader("Allow", ["PATCH"]);
  return res.status(405).end("Method Not Allowed");
}