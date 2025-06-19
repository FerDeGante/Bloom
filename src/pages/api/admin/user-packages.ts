// src/pages/api/admin/user-packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession }               from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import prisma                             from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ id: string; name: string; sessions: number; remaining: number }[] | { error: string }>
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  if (req.method !== "GET" || !userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const ups = await prisma.userPackage.findMany({
    where: { userId },
    include: { pkg: { select: { name: true, sessions: true } } }
  });

  const out = ups.map(u => ({
    id:        u.id,
    name:      u.pkg.name,
    sessions:  u.pkg.sessions,
    remaining: u.sessionsRemaining
  }));

  await prisma.$disconnect();
  return res.status(200).json(out);
}