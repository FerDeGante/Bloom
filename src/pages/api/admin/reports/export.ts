import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const { from, to } = req.query as { from?: string; to?: string };
  if (!from || !to) return res.status(400).json({ error: "Invalid range" });

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const rows = await prisma.reservation.findMany({
    where: { date: { gte: fromDate, lte: toDate } },
    select: {
      date:          true,
      paymentMethod: true,
      user:      { select: { name: true } },
      service:   { select: { name: true } },
      therapist: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "asc" },
  });

  let csv = "Fecha,Cliente,Servicio,Terapeuta,Monto,Metodo\n";
  for (const r of rows) {
    csv += `${r.date.toISOString()},${r.user.name},${r.service.name},${r.therapist?.user?.name ?? "—"},0,${r.paymentMethod}\n`;
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=report-${from}-${to}.csv`
  );
  res.status(200).send(csv);
}
