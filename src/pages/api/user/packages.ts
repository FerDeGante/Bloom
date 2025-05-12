// src/pages/api/user/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "No autorizado" });
  }

  // Buscamos UserPackage para este usuario e incluimos el Package
  const userPackages = await prisma.userPackage.findMany({
    where: { userId: session.user.id },
    include: { pkg: true },
  });

  const packages = userPackages.map((up) => ({
    id: up.pkg.id,
    title: up.pkg.name,
    sessions: up.pkg.sessions,
    price: up.pkg.price,
    inscription: up.pkg.inscription,
  }));

  return res.status(200).json({ packages });
}
