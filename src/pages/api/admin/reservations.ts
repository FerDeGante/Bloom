import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  if (req.method === "POST") {
    const { userId, serviceId, therapistId, date, paymentMethod } = req.body as {
      userId: string;
      serviceId: string;
      therapistId: string;
      date: string;
      paymentMethod: string;
    };

    const conflict = await prisma.reservation.findFirst({
      where: { therapistId, date: new Date(date) },
    });
    if (conflict) {
      return res
        .status(409)
        .json({ error: "Terapeuta no disponible en esa fecha/hora" });
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId,
        serviceId,
        therapistId,
        date: new Date(date),
        paymentMethod: paymentMethod || "efectivo",
        paidAt: new Date(),
      },
    });
    return res.status(200).json({ success: true, reservation });
  }

  if (req.method === "GET") {
    const { start, end } = req.query as { start?: string; end?: string };
    if (!start || !end) return res.status(400).json({ error: "Invalid range" });
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    const rows = await prisma.reservation.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      include: { user: true, therapist: true, service: true },
    });
    const data = rows.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      userId: r.userId,
      userName: r.user.name,
      therapistId: r.therapistId,
      therapistName: r.therapist.name,
      serviceName: r.service.name,
      paymentMethod: r.paymentMethod,
    }));
    return res.status(200).json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
