// src/pages/api/dashboard/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export interface UserPackageResponse {
  id: string;               // ← identificador único de la compra
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

  const session = await getSession({ req });
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // traemos todas las compras del usuario, más recientes primero
  const ups = await prisma.userPackage.findMany({
    where: { userId: session.user.id },
    include: { pkg: true },
    orderBy: { createdAt: "desc" },
  });

  const data: UserPackageResponse[] = ups.map((u) => {
    // fecha de vencimiento: 30 días después de la compra
    const exp = new Date(u.createdAt);
    exp.setDate(exp.getDate() + u.pkg.inscription);

    return {
      id: u.id,
      pkgId: u.pkg.id,
      pkgName: u.pkg.name,
      priceId: u.pkg.stripePriceId,
      sessionsRemaining: u.sessionsRemaining,
      expiresAt: exp.toISOString(),
      createdAt: u.createdAt.toISOString(),
    };
  });

  return res.status(200).json(data);
}
