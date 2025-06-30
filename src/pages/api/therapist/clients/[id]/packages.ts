import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1) Verificar sesión y rol ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (admin?.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  // 2) Extraer “id” (userId del cliente)
  const { id } = req.query as { id: string };

  if (req.method === "GET") {
    // Obtener todos los paquetes de ese cliente
    const ups = await prisma.userPackage.findMany({
      where: { userId: id },
      include: { package: true }, // <-- corregido: package, no pkg
    });
    const data = ups.map((u) => ({
      id: u.id,
      packageId: u.packageId,                 // <-- corregido
      packageName: u.package?.name ?? "",
      sessionsRemaining: u.sessionsRemaining,
      expiresAt: u.createdAt && u.package?.inscription
        ? new Date(u.createdAt.getTime() + u.package.inscription * 86400000).toISOString()
        : null,
      paymentSource: u.paymentSource,
    }));
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    // Crear un nuevo “UserPackage”
    const { packageId, paymentSource } = req.body as { packageId: string; paymentSource: string };
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return res.status(404).json({ error: "Paquete no encontrado" });
    }

    const userPackage = await prisma.userPackage.create({
      data: {
        userId: id,
        packageId,
        sessionsRemaining: pkg.sessions,
        paymentSource: paymentSource || "efectivo",
      },
    });
    return res.status(200).json({ success: true, userPackage });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end();
}