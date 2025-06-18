// src/pages/api/admin/stats.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }    from "next-auth/next";
import { authOptions }         from "../auth/[...nextauth]";
import prisma                  from "@/lib/prisma";

export interface AdminStats {
  activeMembers: number;
  packagesSoldThisMonth: number;
  reservationsThisMonth: number;
  monthlyRevenue: { month: string; revenue: number }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminStats | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const activeMembers = await prisma.user.count({
      where: { role: "CLIENTE" },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const packagesSoldThisMonth = await prisma.userPackage.count({
      where: { createdAt: { gte: startOfMonth } },
    });
    const reservationsThisMonth = await prisma.reservation.count({
      where: { date: { gte: startOfMonth } },
    });

    const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString("default", { month: "short" });
      return { month, revenue: Math.floor(Math.random() * 5000) };
    }).reverse();

    return res
      .status(200)
      .json({ activeMembers, packagesSoldThisMonth, reservationsThisMonth, monthlyRevenue });
  } catch (e) {
    console.error("Error en /api/admin/stats:", e);
    return res.status(500).json({ error: "Error interno generando estadísticas" });
  }
}
