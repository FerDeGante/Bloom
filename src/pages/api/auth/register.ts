// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Faltan campos" });
  }

  // Validar que no exista
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ error: "Email ya registrado" });
  }

  // Crear usuario
  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashed, role: "CLIENTE" },
  });

  return res.status(201).json({ message: "Usuario creado" });
}
