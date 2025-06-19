import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isTherapist = role === "THERAPIST";
  if (!isAdmin && !isTherapist) {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    const { search = "" } = req.query as { search?: string };
    const where = isTherapist
      ? { id: session.user.id }
      : { name: { contains: search, mode: "insensitive" } };
    const list = await prisma.therapist.findMany({
      where,
      orderBy: { name: "asc" },
    });
    const ok = res.status(200).json(list);
    await prisma.$disconnect();
    return ok;
  }

  if (req.method === "POST") {
    if (!isAdmin) {
      await prisma.$disconnect();
      return res.status(403).json({ error: "Forbidden" });
    }
    const { name, specialty } = req.body as { name: string; specialty?: string };
    const ther = await prisma.therapist.create({ data: { name, specialty } });
    const ok = res.status(200).json(ther);
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  const na = res.status(405).end();
  await prisma.$disconnect();
  return na;
}
