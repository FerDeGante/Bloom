// src/pages/api/user/has-inscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // Importa desde el archivo correcto
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verifica que el método sea GET
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method not allowed");
  }

  // Obtiene la sesión del usuario
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ hasInscription: false });
  }

  // Verifica si el usuario tiene inscripción
  const count = await prisma.userPackage.count({
    where: {
      userId: session.user.id,
      pkg: { name: "Inscripción Bloom" },
    },
  });

  // Responde con el estado de inscripción
  return res.json({ hasInscription: count > 0 });
}