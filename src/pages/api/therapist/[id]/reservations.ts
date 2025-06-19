// src/pages/api/therapist/[id]/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    const na = res.status(405).end(`Method ${req.method} Not Allowed`);
    await prisma.$disconnect();
    return na;
  }

  const reservations = await prisma.reservation.findMany({
    where: { therapistId: id as string },
    include: { service: true, user: true },
    orderBy: { date: "asc" },
  });
  const ok = res.status(200).json(reservations);
  await prisma.$disconnect();
  return ok;
}