// src/pages/api/appointments/route.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  if (req.method === "GET") {
    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: {
        service: true,
        therapist: true,
      },
    });
    return res.json(reservations);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
