// src/pages/api/appointments/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export interface HistoryItem {
  id: string;
  date: string;
  serviceName: string | null;
  therapistName: string | null;
  userPackageId: string | null;
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

  // Trae las reservaciones del usuario con nombre de paquete y terapeuta
  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      date: true,
      userPackageId: true,
      package: { select: { name: true } },
      therapist: { 
        select: { 
          user: { select: { name: true } }
        }
      },
    },
    orderBy: { date: "desc" },
  });

  const data: HistoryItem[] = reservations.map((r) => ({
    id:            r.id,
    date:          r.date.toISOString(),
    serviceName:   r.package?.name ?? null,
    therapistName: r.therapist?.user?.name ?? "—",
    userPackageId: r.userPackageId,
  }));

  await prisma.$disconnect();
  return res.status(200).json(data);
}