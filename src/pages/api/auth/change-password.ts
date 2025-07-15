import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const session = await getServerSession(req, res, authOptions);
  const { currentPassword, newPassword, email, token } = req.body as {
    currentPassword?: string;
    newPassword: string;
    email?: string;
    token?: string;
  };

  if (!newPassword) {
    return res.status(400).json({ error: "Falta nueva contraseña" });
  }

  let user;

  if (session?.user?.id) {
    // Caso 1: Usuario logueado con sesión
    if (!currentPassword) {
      return res.status(400).json({ error: "Falta contraseña actual" });
    }

    user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }
  } else {
    // Caso 2: Cambio por recuperación con código enviado al correo
    if (!email || !token) {
      return res.status(400).json({ error: "Faltan email o código" });
    }

    const validToken = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        token,
        expires: { gte: new Date() },
      },
    });

    if (!validToken) {
      return res.status(400).json({ error: "Código inválido o expirado" });
    }

    user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Elimina el token usado después de validar
    await prisma.passwordResetToken.deleteMany({ where: { email } });
  }

  // Hashea y actualiza la contraseña
  const hashed = await hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return res.status(200).json({ message: "Contraseña actualizada correctamente" });
}
