// src/pages/api/therapist/[id]/reservations.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const reservations = await prisma.reservation.findMany({
    where: { therapistId: id as string },
    include: { service: true, user: true },
    orderBy: { date: "asc" },
  });
  return res.status(200).json(reservations);
}