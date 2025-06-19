import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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

  if (req.method === "GET") {
    const { search = "" } = req.query as { search?: string };
    const clients = await prisma.user.findMany({
      where: {
        role: "CLIENTE",
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
    const ok = res.status(200).json(clients);
    await prisma.$disconnect();
    return ok;
  }

  if (req.method === "POST") {
    const { name, email, phone, password } = req.body as {
      name: string;
      email: string;
      phone?: string;
      password: string;
    };
    const hashed = await bcrypt.hash(password, 10);
    const client = await prisma.user.create({
      data: { name, email, phone, password: hashed, role: "CLIENTE" },
    });
    const ok = res.status(200).json(client);
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  const na = res.status(405).end();
  await prisma.$disconnect();
  return na;
}
