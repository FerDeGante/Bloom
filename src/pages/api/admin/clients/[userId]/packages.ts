import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const { userId } = req.query as { userId: string };

  if (req.method === "GET") {
    const ups = await prisma.userPackage.findMany({
      where: { userId },
      include: { pkg: true },
    });
    const data = ups.map((u) => ({
      id: u.id,
      pkgId: u.pkgId,
      pkgName: u.pkg.name,
      sessionsRemaining: u.sessionsRemaining,
      expiresAt: new Date(u.createdAt.getTime() + u.pkg.inscription * 86400000).toISOString(),
      paymentSource: u.paymentSource,
    }));
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { pkgId, paymentSource } = req.body as { pkgId: string; paymentSource: string };
    const pkg = await prisma.package.findUnique({ where: { id: pkgId } });
    if (!pkg) return res.status(404).json({ error: "Paquete no encontrado" });
    const userPackage = await prisma.userPackage.create({
      data: {
        userId,
        pkgId,
        sessionsRemaining: pkg.sessions,
        paymentSource: paymentSource || "efectivo",
      },
    });
    return res.status(200).json({ success: true, userPackage });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}
