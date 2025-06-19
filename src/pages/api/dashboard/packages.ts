// src/pages/api/dashboard/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";                  // <-- cambio aquí
import { authOptions }     from "../auth/[...nextauth]";            // <-- e incluimos tus opciones
import prisma              from "@/lib/prisma";

export interface UserPackageResponse {
  id: string;               // identificador único de la compra
  pkgId: string;
  pkgName: string;
  priceId: string;
  sessionsRemaining: number;
  expiresAt: string;
  createdAt: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UserPackageResponse[] | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1) Usar getServerSession para leer correctamente la cookie
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 2) Traemos las compras del usuario
  const ups = await prisma.userPackage.findMany({
    where: { userId: session.user.id },
    include: { pkg: true },
    orderBy: { createdAt: "desc" },
  });

  // 3) Mapeamos al shape de la API
  const data: UserPackageResponse[] = ups.map((u) => {
    const created = u.createdAt;
    // expiración fija de 30 días tras la compra
    const exp = new Date(created);
    exp.setDate(exp.getDate() + 30);

    return {
      id:                u.id,
      pkgId:             u.pkg.id,
      pkgName:           u.pkg.name,
      priceId:           u.pkg.stripePriceId,
      sessionsRemaining: u.sessionsRemaining,
      expiresAt:         exp.toISOString(),           // 30 días después
      createdAt:         created.toISOString(),
    };
  });

  // 4) Cerramos conexión y devolvemos
  await prisma.$disconnect();
  return res.status(200).json(data);
}