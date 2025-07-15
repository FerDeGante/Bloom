import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { randomInt } from 'crypto';
import { sendCodeEmail } from '@/lib/sendCodeEmail'; // Usa la nueva función

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, checkUser = true, purpose = "reset" } = req.body; 
  // purpose: "register" o "reset". Por defecto, reset.

  if (!email) {
    return res.status(400).json({ error: "Falta el email." });
  }

  if (checkUser) {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) {
      return res.status(404).json({ error: 'Email no registrado.' });
    }
  }

  // Si ya hay un token reciente, elimínalo antes de crear uno nuevo (opcional)
  await prisma.passwordResetToken.deleteMany({
    where: { email },
  });

  const token = randomInt(100000, 999999).toString();

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 10 * 60000), // 10 minutos
    },
  });

  // Llama a la función personalizada que cambia el texto según "purpose"
  await sendCodeEmail({
    email,
    code: token,
    purpose, // "register" o "reset"
  });

  res.status(200).json({ message: 'Código enviado al correo electrónico.' });
}
