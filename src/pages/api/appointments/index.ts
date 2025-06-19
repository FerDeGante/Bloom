import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      select: {
        id:   true,
        date: true,
        service:   { select: { name: true } },
        therapist: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: "desc" },
    });

    const mapped = reservations.map((r) => ({
      id: r.id,
      date: r.date.toISOString(),
      serviceName: r.service?.name ?? null,
      therapistName: r.therapist?.user?.name ?? null,
    }));

    const ok = res.status(200).json({ reservations: mapped });
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET"]);
  const na = res.status(405).end(`Method ${req.method} Not Allowed`);
  await prisma.$disconnect();
  return na;
}
