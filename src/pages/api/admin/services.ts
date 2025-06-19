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
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    const list = await prisma.service.findMany({ orderBy: { name: "asc" } });
    const ok = res.status(200).json(list);
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET"]);
  const na = res.status(405).end();
  await prisma.$disconnect();
  return na;
}
