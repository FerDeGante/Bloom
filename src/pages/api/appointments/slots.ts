// src/pages/api/appointments/slots.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { date, therapistId } = req.query as { date: string; therapistId: string };
  const start = new Date(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const taken = await prisma.reservation.findMany({
    where: {
      therapistId,
      date: { gte: start, lt: end },
    },
  });
  const hours = taken.map((r) => new Date(r.date).getHours());
  res.json(hours);
}
