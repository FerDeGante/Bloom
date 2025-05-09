// src/pages/api/appointments/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../authOptions";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).end();

  const { servicio, terapeuta, date, hour } = req.body;
  const svc = await prisma.service.findUnique({ where: { id: servicio } });
  const ther = await prisma.therapist.findFirst({ where: { name: terapeuta } });
  if (!svc || !ther) return res.status(400).end();

  await prisma.reservation.create({
    data: {
      userId: session.user.id,
      serviceId: svc.id,
      therapistId: ther.id,
      date: new Date(date), // o combinar con hour
    },
  });
  res.status(200).end();
}
