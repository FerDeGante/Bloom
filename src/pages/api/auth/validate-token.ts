// src/pages/api/auth/validate-token.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, token } = req.body;

  const validToken = await prisma.passwordResetToken.findFirst({
    where: {
      email,
      token,
      expires: { gte: new Date() },
    },
  });

  if (!validToken) return res.status(400).json({ error: 'Código inválido o expirado.' });

  res.status(200).json({ message: 'Código válido.' });
}
