// src/pages/api/packages.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export interface PackageOffer {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
  validityDays: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PackageOffer[]>
) {
  const pkgs = await prisma.package.findMany();
  // Añadimos descripción genérica y vigencia fija de 30 días
  const out: PackageOffer[] = pkgs.map((p) => ({
    id: p.id,
    name: p.name,
    sessions: p.sessions,
    price: p.price,
    description: `Este paquete incluye ${p.sessions} sesiones válidas por ${p.inscription} días.`,
    validityDays: p.inscription,
  }));
  res.status(200).json(out);
}
