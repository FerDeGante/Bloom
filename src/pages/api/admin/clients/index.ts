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
    const clients = await prisma.user.findMany({
      where: { role: "CLIENTE" },
      select: { id: true, name: true, email: true, phone: true },
    });
    return res.status(200).json(clients);
  }

  res.setHeader("Allow", ["GET"]);
  res.status(405).end();
}
