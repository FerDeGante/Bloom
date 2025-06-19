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
  res: NextApiResponse<Reservation | Reservation[] | CalendarReservation[] | { error: string }>
) {
  // 1) Auth & rol ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  const role = me?.role;
  const isAdmin = role === "ADMIN";
  const isTherapist = role === "THERAPIST";
  if (!isAdmin && !isTherapist) {
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
    if (!isAdmin) {
      await prisma.$disconnect();
      return res.status(403).json({ error: "Forbidden" });
    }
    const from = new Date(start);
    const to   = new Date(end);

    const rows = await prisma.reservation.findMany({
      where: {
        date: { gte: from, lte: to },
        NOT: { userPackageId: null },   // excluimos NULLs sin usar not: ""
      },
      include: {
        user:       { select: { name: true } },
        service:    { select: { name: true } },
        therapist:  { select: { name: true } },
        userPackage:{ include: { pkg: { select: { sessions: true } } } },
      },
      orderBy: { date: "asc" },
    });

    // Agrupar por paquete para numerar sesiones
    const byPkg: Record<string, typeof rows> = {};
    for (const r of rows) {
      if (!r.userPackageId) continue;       // por si quedara null
      const pkgId = r.userPackageId;
      byPkg[pkgId] = byPkg[pkgId] || [];
      byPkg[pkgId].push(r);
    }

    // Construir resultado tipado
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

    const r = res.status(200).json(result);
    await prisma.$disconnect();
    return r;
  }

  // 3) GET día único → sólo fechas ISO
  if (req.method === "GET" && date) {
    if (!isAdmin) {
      await prisma.$disconnect();
      return res.status(403).json({ error: "Forbidden" });
    }
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
    const r = res.status(200).json(calendarData);
    await prisma.$disconnect();
    return r;
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
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    if (isTherapist && therapistId !== session.user.id) {
      await prisma.$disconnect();
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const r = await prisma.reservation.create({
        data: {
          userId,
          userPackageId,
          serviceId,
          therapistId,
          date: new Date(iso),
          paymentMethod,
        },
      });
      const created: Reservation = {
        id:            r.id,
        date:          r.date.toISOString(),
        userName:      session.user.name ?? "—",
        serviceName:   "",
        therapistName: "",
        paymentMethod: r.paymentMethod,
        sessionNumber: 0,
        totalSessions: 0,
      };
      const response = res.status(201).json(created);
      await prisma.$disconnect();
      return response;
    } catch (e) {
      console.error("Error creando reserva:", e);
      const errorResponse = res.status(500).json({ error: "Error interno al crear la reserva." });
      await prisma.$disconnect();
      return errorResponse;
    }
  }

  // 5) Otros métodos no permitidos
  res.setHeader("Allow", ["GET", "POST"]);
  const notAllowed = res.status(405).end("Method Not Allowed");
  await prisma.$disconnect();
  return notAllowed;
}
