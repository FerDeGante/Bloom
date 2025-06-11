// src/pages/api/admin/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }         from "next-auth/next";
import { authOptions }              from "../auth/[...nextauth]";
import prisma                       from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) verificación de sesión y rol ADMIN:
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

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
    return res.status(200).json(list);
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end("Method Not Allowed");
}