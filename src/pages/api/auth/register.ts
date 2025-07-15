import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { hash } from "bcrypt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const { name, email, password, token, phone } = req.body;

  if (!name || !email || !password || !token || !phone)
    return res.status(400).json({ error: "Faltan campos" });

  const validToken = await prisma.passwordResetToken.findFirst({
    where: { email, token, expires: { gte: new Date() } },
  });

  if (!validToken)
    return res.status(400).json({ error: "Código inválido o expirado" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    return res.status(400).json({ error: "Email ya existe" });

  const hashed = await hash(password, 10);

  await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashed, 
      phone,       // agregado
      role: "CLIENT" 
    },
  });

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  return res.status(201).json({ message: "Usuario creado" });
}
