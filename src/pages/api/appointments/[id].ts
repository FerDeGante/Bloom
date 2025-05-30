import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query as { id: string };
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Only allow modifying the user's own reservation
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation || reservation.userId !== session.user.id) {
    return res.status(404).json({ error: "Reservation not found" });
  }

  if (req.method === "PUT") {
    const { date } = req.body as { date?: string };
    if (!date) {
      return res.status(400).json({ error: "Missing date" });
    }
    await prisma.reservation.update({
      where: { id },
      data: { date: new Date(date) },
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    await prisma.reservation.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
