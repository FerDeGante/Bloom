import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  if (req.method === "GET") {
    const { search = "" } = req.query as { search?: string };
    const list = await prisma.therapist.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      orderBy: { name: "asc" },
    });
    return res.status(200).json(list);
  }

  if (req.method === "POST") {
    const { name, specialty } = req.body as { name: string; specialty?: string };
    const ther = await prisma.therapist.create({ data: { name, specialty } });
    return res.status(200).json(ther);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
