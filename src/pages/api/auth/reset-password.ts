// src/pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

// Función para validar contraseña fuerte: mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un caracter especial.
function isStrongPassword(pwd: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&^()\-_=+{}[\]|\\:;"'<>,./?]).{8,}$/.test(pwd);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { email, token, password } = req.body;
  if (!email || !token || !password)
    return res.status(400).json({ error: "Faltan campos" });

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      error:
        "La contraseña debe tener al menos 8 caracteres, incluir mayúscula, minúscula, número y un símbolo especial.",
    });
  }

  // Busca el token válido y no expirado
  const validToken = await prisma.passwordResetToken.findFirst({
    where: { email, token, expires: { gte: new Date() } },
  });

  if (!validToken) {
    // Respuesta genérica para evitar que adivinen correos válidos
    return res.status(400).json({ error: "Código inválido o expirado" });
  }

  // Busca el usuario (de nuevo, no especifica si no existe)
  const user = await prisma.user.findUnique({ where: { email } });

  // Borra todos los tokens para ese email (siempre, por seguridad)
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  if (!user) {
    // Mismo mensaje para evitar enumeración
    return res.status(200).json({ message: "Contraseña cambiada correctamente" });
  }

  const hashed = await hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  return res.status(200).json({ message: "Contraseña cambiada correctamente" });
}
