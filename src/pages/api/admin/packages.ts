// src/pages/api/admin/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }         from "next-auth/next";
import { authOptions }              from "../auth/[...nextauth]";
import prisma                       from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) verificación de sesión y rol ADMIN:
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
    // 2) devolvemos todos los paquetes con id, name y sessions
    const list = await prisma.package.findMany({
      orderBy: { name: "asc" },
      select: {
        id:       true,
        name:     true,
        sessions: true,
      },
    });
    const ok = res.status(200).json(list);
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET"]);
  const na = res.status(405).end("Method Not Allowed");
  await prisma.$disconnect();
  return na;
}