// src/pages/api/appointments/history.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  if (!session || !session.user?.id) return res.status(401).end();

  const hist = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    include: { service: true, therapist: true },
    orderBy: { date: "desc" },
  });
  res.json(
    hist.map((r) => ({
      id: r.id,
      date: r.date,
      serviceName: r.service.name,
      therapistName: r.therapist.name,
    }))
  );
}
