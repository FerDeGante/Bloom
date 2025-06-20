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
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  const { start, end } = req.query as { start?: string; end?: string };
  if (!start || !end) {
    await prisma.$disconnect();
    return res.status(400).json({ error: "Invalid range" });
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  const transactions = await prisma.reservation.findMany({
    where: {
      paidAt: { not: null },
      date: { gte: startDate, lte: endDate },
    },
    include: { 
      user: { select: { name: true } },
      therapist: { 
        include: {
          user: { select: { name: true } } // Accedemos al nombre a través de la relación con User
        }
      },
      service: { select: { name: true } },
      userPackage: { 
        select: { 
          pkg: { select: { price: true } } 
        } 
      }
    },
    orderBy: { date: "asc" },
  });

  const summary = {
    totalStripe: transactions
      .filter((t) => t.paymentMethod === "stripe")
      .reduce((sum, r) => sum + (r.userPackage?.pkg?.price || 0), 0),
    totalEfectivo: transactions
      .filter((t) => t.paymentMethod === "efectivo")
      .reduce((sum, r) => sum + (r.userPackage?.pkg?.price || 0), 0),
  };

  const data = transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString(),
    userName: t.user.name,
    therapistName: t.therapist.user.name, // Accedemos al nombre del terapeuta a través de user
    serviceName: t.service.name,
    amount: t.userPackage?.pkg?.price || 0,
    paymentMethod: t.paymentMethod,
    packageUsed: !!t.userPackageId,
  }));

  const ok = res.status(200).json({ summary, transactions: data });
  await prisma.$disconnect();
  return ok;
}
