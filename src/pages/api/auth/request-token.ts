// src/pages/api/auth/request-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { sendResetToken } from '@/lib/sendResetToken';
import { randomInt } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, checkUser = true } = req.body; // ← parámetro nuevo (por defecto true)

  if (checkUser) {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (!userExists) {
      return res.status(404).json({ error: 'Email no registrado.' });
    }
  }

  const token = randomInt(100000, 999999).toString();

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires: new Date(Date.now() + 10 * 60000), // 10 minutos
    },
  });

  await sendResetToken(email, token);

  res.status(200).json({ message: 'Código enviado al correo electrónico.' });
}
