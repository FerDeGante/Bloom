// src/pages/api/admin/reports.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }        from "next-auth/next";
import { authOptions }             from "../auth/[...nextauth]";
import prisma                      from "@/lib/prisma";

type ReportRow = {
  id:           string;
  date:         Date;
  clientName:   string;
  serviceName:  string;
  therapistName:string;
  paymentMethod:string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Validación de sesión y rol ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) Sólo GET
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // 3) Parámetros ?from=YYYY-MM-DD&to=YYYY-MM-DD
  const { from, to } = req.query as { from?: string; to?: string };
  if (!from || !to) {
    return res
      .status(400)
      .json({ error: "Invalid range: se requieren 'from' y 'to' en formato YYYY-MM-DD." });
  }

  try {
    // 4) Parsear fechas y ajustar hora final
    const fromDate = new Date(from);
    const toDate   = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    // 5) Traer datos con SQL bruto para filtrar NULL y evitar errores de TS/Prisma
    const rows = await prisma.$queryRaw<ReportRow[]>`
      SELECT
        r.id,
        r.date,
        u.name    AS "clientName",
        s.name    AS "serviceName",
        t.name    AS "therapistName",
        r."paymentMethod" AS "paymentMethod"
      FROM "Reservation" r
      JOIN "User"      u ON u.id       = r."userId"
      JOIN "Service"   s ON s.id       = r."serviceId"
      JOIN "Therapist" t ON t.id       = r."therapistId"
      WHERE
        r.date >= ${fromDate} AND
        r.date <= ${toDate}   AND
        r."userPackageId" IS NOT NULL
      ORDER BY r.date ASC;
    `;

    // 6) Calcular totales por día
    const totalsMap: Record<string, { count: number; totalAmount: number }> = {};
    rows.forEach((r) => {
      // r.date es Date gracias al mapeo genérico
      const day = r.date.toISOString().split("T")[0];
      if (!totalsMap[day]) totalsMap[day] = { count: 0, totalAmount: 0 };
      totalsMap[day].count += 1;
      totalsMap[day].totalAmount += 1; // o usa un campo real de monto si lo tienes
    });
    const totalByDay = Object.entries(totalsMap).map(([date, info]) => ({
      date,
      count: info.count,
      totalAmount: info.totalAmount,
    }));

    // 7) Formar detalle de reservas
    const details = rows.map((r) => ({
      id:            r.id,
      date:          r.date.toISOString(),
      clientName:    r.clientName,
      serviceName:   r.serviceName,
      therapistName: r.therapistName,
      amount:        1,               // o tu campo real de monto
      paymentMethod: r.paymentMethod,
    }));

    // 8) Enviar resultado
    return res.status(200).json({ totalByDay, details });
  } catch (err) {
    console.error("Error en /api/admin/reports:", err);
    return res
      .status(500)
      .json({ error: "Error interno generando los reportes." });
  }
}