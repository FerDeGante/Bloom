// src/pages/api/admin/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }               from "next-auth/next";
import { authOptions }                    from "../auth/[...nextauth]";
import prisma                             from "@/lib/prisma";

export interface CalendarReservation {
  date: string;
}

export interface Reservation {
  id: string;
  date: string;
  userName: string;
  serviceName: string;
  therapistName: string;
  paymentMethod: string;
  sessionNumber: number;
  totalSessions: number;
}

export default async function handler(
  req: NextApiRequest,
  // incluimos también `Reservation` en el tipo de respuesta
  res: NextApiResponse<
    | Reservation
    | Reservation[]
    | CalendarReservation[]
    | { error: string }
  >
) {
  // 1) Auth & rol ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  const { start, end, date } = req.query as {
    start?: string;
    end?: string;
    date?: string;
  };

  // 2) GET rango completo (para el calendario)
  if (req.method === "GET" && start && end) {
    const from = new Date(start);
    const to   = new Date(end);

    const rows = await prisma.reservation.findMany({
      where: {
        date: { gte: from, lte: to },
        NOT: { userPackageId: null },
      },
      include: {
        user:       { select: { name: true } },
        service:    { select: { name: true } },
        therapist:  { select: { name: true } },
        userPackage:{ include: { pkg: { select: { sessions: true } } } },
      },
      orderBy: { date: "asc" },
    });

    const byPkg: Record<string, typeof rows> = {};
    for (const r of rows) {
      if (!r.userPackageId) continue;
      byPkg[r.userPackageId] ||= [];
      byPkg[r.userPackageId].push(r);
    }

    const result: Reservation[] = [];
    for (const group of Object.values(byPkg)) {
      group.sort((a, b) => a.date.getTime() - b.date.getTime());
      const total = group[0].userPackage!.pkg.sessions;
      group.forEach((r, idx) => {
        result.push({
          id:            r.id,
          date:          r.date.toISOString(),
          userName:      r.user.name ?? "—",
          serviceName:   r.service.name,
          therapistName: r.therapist.name,
          paymentMethod: r.paymentMethod,
          sessionNumber: idx + 1,
          totalSessions: total,
        });
      });
    }

    const out = res.status(200).json(result);
    await prisma.$disconnect();
    return out;
  }

  // 3) GET día único → sólo fechas ISO
  if (req.method === "GET" && date) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);

    const existing = await prisma.reservation.findMany({
      where: { date: { gte: day, lt: next } },
      select: { date: true },
    });

    const calendarData: CalendarReservation[] = existing.map((r) => ({
      date: r.date.toISOString(),
    }));
    const out = res.status(200).json(calendarData);
    await prisma.$disconnect();
    return out;
  }

  // 4) POST → crear nueva reserva manual
  if (req.method === "POST") {
    const {
      userId,
      userPackageId,
      serviceId,
      therapistId,
      date:    iso,
      paymentMethod,
    } = req.body as {
      userId:         string;
      userPackageId:  string;
      serviceId:      string;
      therapistId:    string;
      date:           string;
      paymentMethod:  string;
    };

    if (
      !userId ||
      !userPackageId ||
      !serviceId ||
      !therapistId ||
      !iso ||
      !paymentMethod
    ) {
      await prisma.$disconnect();
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    try {
      const [created] = await prisma.$transaction([
        prisma.reservation.create({
          data: {
            userId,
            userPackageId,
            serviceId,
            therapistId,
            date: new Date(iso),
            paymentMethod,
            paidAt: new Date(),
          },
        }),
        prisma.userPackage.update({
          where: { id: userPackageId },
          data: { sessionsRemaining: { decrement: 1 } },
        }),
      ]);

      const full = await prisma.reservation.findUnique({
        where: { id: created.id },
        include: {
          user:       { select: { name: true } },
          service:    { select: { name: true } },
          therapist:  { select: { name: true } },
          userPackage:{ include: { pkg: { select: { sessions: true } } } },
        },
      });

      if (!full) throw new Error("No se creó la reserva");

      const countUsed =
        (full.userPackage?.pkg.sessions || 1) -
        (full.userPackage?.sessionsRemaining || 0);

      const outRes: Reservation = {
        id:            full.id,
        date:          full.date.toISOString(),
        userName:      full.user.name ?? "—",
        serviceName:   full.service.name,
        therapistName: full.therapist.name,
        paymentMethod: full.paymentMethod,
        sessionNumber: countUsed,
        totalSessions: full.userPackage?.pkg.sessions || 1,
      };
      const out = res.status(201).json(outRes);
      await prisma.$disconnect();
      return out;
    } catch (e) {
      console.error("Error creando reserva:", e);
      await prisma.$disconnect();
      return res
        .status(500)
        .json({ error: "Error interno al crear la reserva." });
    }
  }

  // 5) Métodos no permitidos
  res.setHeader("Allow", ["GET", "POST"]);
  await prisma.$disconnect();
  return res.status(405).end("Method Not Allowed");
}
