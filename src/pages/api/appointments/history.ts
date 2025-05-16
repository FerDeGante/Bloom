import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const hist = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { service: true, therapist: true },
    orderBy: { date: "desc" },
  });

  const data: HistoryItem[] = hist.map(r => ({
    id: r.id,
    date: r.date.toISOString(),
    serviceName: r.service.name,
    therapistName: r.therapist.name,
  }));

  return res.status(200).json(data);
}