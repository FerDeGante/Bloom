// src/pages/api/admin/reservations.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

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

  // ----------- POST: crear reservación -----------
  if (req.method === "POST") {
    const {
      userId,
      packageId,
      date, // ISO string
      paymentMethod,
      branchId,
      userPackageId,
    } = req.body as {
      userId: string;
      packageId: string;
      date: string;
      paymentMethod: string;
      branchId?: string;
      userPackageId?: string;
    };

    if (!userId || !packageId || !date || !paymentMethod || !branchId) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) return res.status(400).json({ error: "Paquete no encontrado" });

    // Buscar o crear UserPackage
    let upkgId = userPackageId;
    if (!upkgId) {
      let userPackage = await prisma.userPackage.findFirst({
        where: {
          userId,
          packageId,
          sessionsRemaining: { gt: 0 },
        },
      });
      if (!userPackage) {
        userPackage = await prisma.userPackage.create({
          data: {
            userId,
            packageId,
            sessionsRemaining: pkg.sessions,
            paymentSource: "manual",
          },
        });
      }
      upkgId = userPackage.id;
    }

    // Validar que no rebase el número de sesiones
    const currentResCount = await prisma.reservation.count({
      where: { userPackageId: upkgId },
    });
    if (currentResCount >= pkg.sessions) {
      return res.status(409).json({ error: "Ya has reservado todas las sesiones de este paquete." });
    }

    // Checar aforo
    const slotDate = new Date(date);
    const slotISO = slotDate.toISOString();
    const slotCount = await prisma.reservation.count({
      where: {
        date: slotISO,
        branchId: branchId,
        packageId: packageId,
      },
    });
    let maxPerSlot = 1;
    if (/agua/i.test(pkg.name) || /piso/i.test(pkg.name)) {
      maxPerSlot = 3;
    }

    if (slotCount >= maxPerSlot) {
      return res.status(409).json({ error: "Horario no disponible para este paquete." });
    }

    try {
      const created = await prisma.reservation.create({
        data: {
          userId,
          packageId,
          date: slotDate,
          paymentMethod,
          branchId,
          userPackageId: upkgId,
        },
      });

      return res.status(201).json({
        id: created.id,
        date: created.date.toISOString(),
        userId: created.userId,
        packageId: created.packageId,
        paymentMethod: created.paymentMethod,
        branchId: created.branchId,
        userPackageId: created.userPackageId,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: "Error interno al crear la reservación." });
    }
  }

  // ----------- GET: consultar reservaciones -----------
  if (req.method === "GET") {
    const { date, start, end } = req.query as { date?: string; start?: string; end?: string };

    // --- POR DÍA ---
    if (date) {
      const dayStart = new Date(date + "T00:00:00");
      const dayEnd = new Date(date + "T23:59:59.999");

      const reservations = await prisma.reservation.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        include: {
          user: { select: { name: true } },
          package: { select: { name: true, sessions: true, price: true } },
          therapist: { include: { user: { select: { name: true } } } },
          userPackage: { select: { id: true } },
        },
        orderBy: { date: "asc" },
      });

      // Para calcular sessionNumber correctamente por cada userPackage
      let userPackagesReservs: { [upId: string]: any[] } = {};
      const upIds = Array.from(new Set(reservations.map(r => r.userPackage?.id).filter(Boolean)));
      await Promise.all(
        upIds.map(async (upId) => {
          if (upId) {
            userPackagesReservs[upId] = await prisma.reservation.findMany({
              where: { userPackageId: upId },
              orderBy: { date: "asc" },
            });
          }
        })
      );

      const result = reservations.map((r) => {
        let sessionNumber = 1;
        let totalSessions = r.package?.sessions || 1;
        const upId = r.userPackage?.id;
        if (upId && userPackagesReservs[upId]) {
          const todas = userPackagesReservs[upId];
          todas.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          sessionNumber = todas.findIndex(sess => sess.id === r.id) + 1;
          if (todas.length > 0 && r.package?.sessions)
            totalSessions = r.package.sessions;
        }
        return {
          id: r.id,
          date: r.date.toISOString(),
          userName: r.user?.name || "",
          serviceName: r.package?.name || "",
          therapistName: r.therapist?.user?.name || "",
          paymentMethod: r.paymentMethod,
          sessionNumber,
          totalSessions,
          packagePrice: r.package?.price ?? null,
        };
      });

      return res.status(200).json(result);
    }

    // --- POR RANGO (para el calendario) ---
    if (start && end) {
      const reservations = await prisma.reservation.findMany({
        where: {
          date: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
        select: { date: true },
      });

      return res.status(200).json(reservations);
    }

    return res.status(400).json({ error: "Faltan parámetros: date o start/end" });
  }

  // ----------- PATCH: Reprogramar reservación -----------
  if (req.method === "PATCH") {
    const { reservationId, newDate, newTime } = req.body as {
      reservationId: string;
      newDate: string;
      newTime: string;
    };

    if (!reservationId || !newDate || !newTime) {
      return res.status(400).json({ error: "Datos incompletos." });
    }

    // Buscar la reservación existente
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { package: true, user: true, branch: true }
    });
    if (!reservation) {
      return res.status(404).json({ error: "Reservación no encontrada." });
    }

    // Verificar vigencia del paquete (30 días desde la primera sesión)
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
    const minDate = new Date(firstSessionDate);
    const maxDate = new Date(firstSessionDate);
    maxDate.setDate(maxDate.getDate() + 29);
    const newDateObj = new Date(newDate + "T" + newTime);

    if (newDateObj < minDate || newDateObj > maxDate) {
      return res.status(400).json({ error: "La nueva fecha debe estar dentro de la vigencia del paquete (30 días)." });
    }

    // Validar disponibilidad/aforo
    let maxPerSlot = 1;
    let slotWhere: any = {
      date: newDateObj,
      branchId: reservation.branchId,
    };
    if (/agua/i.test(reservation.package.name) || /piso/i.test(reservation.package.name)) {
      slotWhere.packageId = reservation.packageId;
      maxPerSlot = 3;
    }

    const slotCount = await prisma.reservation.count({
      where: {
        ...slotWhere,
        id: { not: reservationId }
      }
    });

    if (slotCount >= maxPerSlot) {
      return res.status(409).json({ error: "Horario no disponible para este paquete." });
    }

    try {
      const updated = await prisma.reservation.update({
        where: { id: reservationId },
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

  res.setHeader("Allow", ["GET", "POST", "PATCH"]);
  return res.status(405).end("Method Not Allowed");
}