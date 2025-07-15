// src/pages/api/appointments/route.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  if (req.method === "GET") {
    const reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: {
        package: true, // <-- Corrección aquí
        therapist: {
          include: {
            user: { select: { name: true } }
          }
        },
        branch: true // <-- opcional: solo si necesitas mostrar la sucursal
      },
      orderBy: { date: "desc" },
    });

    // Si quieres devolver solo campos clave:
    const mapped = reservations.map(r => ({
      id: r.id,
      date: r.date.toISOString(),
      packageName: r.package?.name ?? null,
      therapistName: r.therapist?.user?.name ?? null,
      branchName: r.branch?.name ?? null,
      // agrega aquí lo que necesites
    }));

    return res.status(200).json({ reservations: mapped });
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}