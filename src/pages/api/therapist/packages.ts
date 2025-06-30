// src/pages/api/admin/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }         from "next-auth/next";
import { authOptions }              from "../auth/[...nextauth]";
import prisma                       from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: string; name: string; sessions: number; price: number }[] | { error: string }>
) {
  // 1) Verificación de sesión y rol Therapist
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }
  const therapist = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (therapist?.role !== "THERAPIST") {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) GET /api/admin/packages → lista de paquetes
  if (req.method === "GET") {
    const list = await prisma.package.findMany({
      orderBy: { name: "asc" },
      select: {
        id:       true,
        name:     true,
        sessions: true,
        price:    true,   // <---- AGREGA ESTA LÍNEA
      },
    });
    await prisma.$disconnect();
    return res.status(200).json(list);
  }

  res.setHeader("Allow", ["GET"]);
  await prisma.$disconnect();
  return res.status(405).end("Method Not Allowed");
}