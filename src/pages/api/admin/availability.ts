// src/pages/api/admin/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import prisma from "@/lib/prisma";

// Devuelve los horarios DISPONIBLES (no ocupados) para ese paquete/sucursal/día,
// excluyendo la reservación especificada si se está reprogramando.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { packageId, branchId, date, excludeReservationId } = req.query as {
    packageId?: string;
    branchId?: string;
    date?: string;
    excludeReservationId?: string;
  };

  // LOG 1: Entrando al endpoint con los parámetros recibidos
  console.log("=== API AVAILABILITY ===");
  console.log({
    packageId,
    branchId,
    date,
    excludeReservationId
  });

  if (!packageId || !branchId || !date) {
    console.log("⚠️ Faltan parámetros obligatorios");
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  // Busca el paquete para saber horarios y duración
  const pkg = await prisma.package.findUnique({ where: { id: packageId } });
  console.log("Paquete encontrado:", pkg);

  if (!pkg) {
    console.log("⚠️ Paquete no encontrado");
    return res.status(404).json({ error: "Paquete no encontrado" });
  }

  // Define horario por paquete y día
  function getSchedule(pkg: any, date: Date) {
    const duration = 30;
    const day = date.getDay();
    if (/Fisioterapia/i.test(pkg.name)) {
      if (day === 6) return { start: 9, end: 17, duration };
      return { start: 9, end: 19, duration };
    }
    if (/agua/i.test(pkg.name)) {
      if (day === 0) return { start: 10, end: 17, duration };
      if (day === 6) return { start: 9, end: 17, duration };
      return { start: 11, end: 19, duration };
    }
    if (/piso/i.test(pkg.name)) {
      if (day === 0) return { start: 10, end: 17, duration };
      if (day === 6) return { start: 9, end: 17, duration };
      return { start: 11, end: 19, duration };
    }
    if (day === 6) return { start: 9, end: 17, duration };
    return { start: 11, end: 19, duration };
  }

  const slotDate = new Date(date);
  const { start, end, duration } = getSchedule(pkg, slotDate);

  console.log("Horario generado para el paquete:", { start, end, duration, day: slotDate.getDay() });

  // Obtén todas las reservaciones ya ocupadas en ese branch/paquete/día
  const dayStart = new Date(date + "T00:00:00");
  const dayEnd = new Date(date + "T23:59:59.999");

  const where: any = {
    packageId,
    branchId,
    date: { gte: dayStart, lte: dayEnd },
  };
  if (excludeReservationId) {
    where.id = { not: excludeReservationId };
  }

  const reservations = await prisma.reservation.findMany({ where });

  // LOG 2: Reservaciones ya ocupadas ese día
  console.log("Reservaciones ya ocupadas:", reservations);

  // Obtén los horarios ocupados
  const reservedTimes = reservations.map((r) => {
    const d = new Date(r.date);
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  });

  console.log("Horarios ocupados:", reservedTimes);

  // Genera slots disponibles según horario y duración, excluyendo los ocupados
  const available: string[] = [];
  let hour = start,
    min = 0;
  const lastSlot = end * 60 - duration;
  while (hour * 60 + min <= lastSlot) {
    const tStr = `${hour.toString().padStart(2, "0")}:${min
      .toString()
      .padStart(2, "0")}`;
    if (!reservedTimes.includes(tStr)) available.push(tStr);
    min += duration;
    if (min >= 60) {
      hour++;
      min = 0;
    }
  }

  // LOG 3: Horarios realmente disponibles
  console.log("SLOTS DISPONIBLES:", available);

  return res.status(200).json(available);
}