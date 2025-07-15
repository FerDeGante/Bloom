import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, email, password, token, phone } = req.body;

  // Chequea campos requeridos
  if (!name || !email || !password || !token || !phone) {
    return res.status(400).json({ error: "Faltan campos." });
  }

  // Checa si ya existe usuario
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ error: "El correo ya está registrado." });
  }

  // Checa token válido y vigente
  const validToken = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      token,
      expires: { gte: new Date() },
    },
  });
  if (!validToken) {
    return res.status(400).json({ error: "Código inválido o expirado." });
  }

  // Crea usuario con hash seguro
  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      phone,
      role: "CLIENT", // o "CLIENTE" según tu modelo
    },
  });

  // Borra los tokens de ese correo (limpieza)
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  return res.status(201).json({ message: "Usuario creado exitosamente." });
}
