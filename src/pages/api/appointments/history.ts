// src/pages/api/appointments/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }                   from "next-auth/next";
import { authOptions }                        from "../auth/[...nextauth]";
import prisma                                 from "@/lib/prisma";

export interface HistoryItem {
  id: string;
  date: string;
  serviceName: string;
  therapistName: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryItem[] | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    await prisma.$disconnect();
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: {
      service:   { select: { name: true } },
      therapist: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  });

  const data: HistoryItem[] = reservations.map((r) => ({
    id:            r.id,
    date:          r.date.toISOString(),
    serviceName:   r.service.name,
    therapistName: r.therapist.user.name ?? "—",   // <-- aquí aseguramos string
  }));

  await prisma.$disconnect();
  return res.status(200).json(data);
}