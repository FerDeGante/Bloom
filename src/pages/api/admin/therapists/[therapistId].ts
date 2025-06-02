import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });

  const { therapistId } = req.query as { therapistId: string };

  if (req.method === "PUT") {
    const { name, specialty, isActive } = req.body as {
      name?: string;
      specialty?: string;
      isActive?: boolean;
    };
    const ther = await prisma.therapist.update({
      where: { id: therapistId },
      data: { name, specialty, isActive },
    });
    return res.status(200).json(ther);
  }

  if (req.method === "DELETE") {
    await prisma.therapist.delete({ where: { id: therapistId } });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  res.status(405).end();
}
