// src/pages/api/user/packages.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getSession({ req });
  if (!session?.user?.id) return res.status(401).json({ error: 'No autorizado' });
  const ups = await prisma.userPackage.findMany({
    where: { userId: session.user.id as string },
    include: { pkg: true },
  });
  res.status(200).json(ups);
}
