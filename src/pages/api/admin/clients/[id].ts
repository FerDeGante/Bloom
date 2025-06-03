import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

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

  // 2) Extraer “id” del path
  const { id } = req.query as { id: string };

  if (req.method === "PUT") {
    // Actualizar datos del cliente
    const { name, email, phone, password } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    const data: any = { name, email, phone };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const client = await prisma.user.update({ where: { id }, data });
    return res.status(200).json(client);
  }

  if (req.method === "DELETE") {
    // Eliminar cliente
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end();
}
