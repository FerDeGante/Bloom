// src/pages/api/admin/reservations.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) Validación de sesión y rol ADMIN
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (me?.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // 2) POST: crear nueva reserva y decrementar sesiones
    if (req.method === "POST") {
      const { userId, serviceId, therapistId, date, paymentMethod, userPackageId } =
        req.body as {
          userId: string;
          serviceId: string;
          therapistId: string;
          date: string;
          paymentMethod: string;
          userPackageId?: string;
        };

      // Chequear conflicto
      const conflict = await prisma.reservation.findFirst({
        where: { therapistId, date: new Date(date) },
      });
      if (conflict) {
        return res
          .status(409)
          .json({ error: "Terapeuta no disponible en esa fecha/hora" });
      }

      // Crear reserva
      const reservation = await prisma.reservation.create({
        data: {
          userId,
          serviceId,
          therapistId,
          date: new Date(date),
          paymentMethod: paymentMethod || "en sucursal",
          paidAt: new Date(),
          ...(userPackageId !== undefined ? { userPackageId } : {}),
        },
      });

      // Decrementar sessionsRemaining SI venía userPackageId
      if (userPackageId) {
        await prisma.userPackage.update({
          where: { id: userPackageId },
          data: { sessionsRemaining: { decrement: 1 } },
        });
      }

      return res.status(200).json({ success: true, reservation });
    }

    // 3) GET: dos modos — rango (start+end) o día suelto (date)
    if (req.method === "GET") {
      const { start, end, date } = req.query as {
        start?: string;
        end?: string;
        date?: string;
      };

      // 3A) Rango completo: sólo devolvemos fechas
      if (start && end) {
        const s = new Date(start);
        const e = new Date(end);
        e.setHours(23, 59, 59, 999);

        const rows = await prisma.reservation.findMany({
          where: { date: { gte: s, lte: e } },
          select: { date: true },
        });

        // Normalizamos a ISO
        return res.status(200).json(
          rows.map(r => ({ date: r.date.toISOString() }))
        );
      }

      // 3B) Día concreto: devolvemos detalles con sesión X/Y
      if (date) {
        const [y, m, d] = date.split("-");
        const dayStart = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
        const dayEnd   = new Date(`${y}-${m}-${d}T23:59:59.999Z`);

        const rows = await prisma.reservation.findMany({
          where: { date: { gte: dayStart, lte: dayEnd } },
          include: {
            user: true,
            service: true,
            therapist: true,
            userPackage: { include: { pkg: true } },
          },
          orderBy: { date: "asc" },
        });

        // Enriquecemos con número de sesión / total
        const enriched = await Promise.all(
          rows.map(async (r) => {
            const pkg = r.userPackage;
            const totalSessions = pkg?.pkg?.sessions ?? 1;
            const countPrev = pkg?.id
              ? await prisma.reservation.count({
                  where: {
                    userPackageId: pkg.id,
                    date: { lt: r.date },
                  },
                })
              : 0;
            const sessionNumber = countPrev + 1;
            return {
              id: r.id,
              date: r.date.toISOString(),
              userName: r.user.name,
              serviceName: r.service.name,
              therapistName: r.therapist.name,
              paymentMethod: r.paymentMethod,
              sessionNumber,
              totalSessions,
            };
          })
        );

        return res.status(200).json(enriched);
      }

      return res
        .status(400)
        .json({ error: "Invalid query: requiere start+end o date" });
    }

    // 4) Métodos no soportados
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end();
  } catch (err) {
    console.error("Error interno en /api/admin/reservations:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}