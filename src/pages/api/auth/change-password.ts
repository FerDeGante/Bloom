// src/pages/api/auth/change-password.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    // Solo permitimos POST
    return res.status(405).end();
  }

  // Obtiene la sesión del usuario
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "No autorizado" });
  }

  // Extrae parámetros del body
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  // Busca el usuario en la base de datos
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return res.status(404).json({ error: "Usuario no encontrado" });
  }

  // Verifica que la contraseña actual coincida
  const isMatch = await compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Contraseña actual incorrecta" });
  }

  // Hashea y guarda la nueva contraseña
  const hashed = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  // Respuesta exitosa
  return res.status(200).json({ message: "Contraseña actualizada correctamente" });
}
