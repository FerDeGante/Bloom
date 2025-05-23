// src/pages/api/dashboard/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "@/lib/prisma";

export interface UserPackageResponse {
  id: string;
  pkgName: string;
  sessionsRemaining: number;
  expiresAt: string;
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

  const ups = await prisma.userPackage.findMany({
    where: { userId: session.user.id },
    include: { pkg: true },
  });

  const data: UserPackageResponse[] = ups.map((u) => {
    const expires = new Date();
    expires.setDate(expires.getDate() + u.pkg.inscription);
    return {
      id: u.id,
      pkgName: u.pkg.name,
      sessionsRemaining: u.pkg.sessions,
      expiresAt: expires.toISOString(),
    };
  });

  res.status(200).json(data);
}
