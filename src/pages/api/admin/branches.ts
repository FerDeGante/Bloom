// src/pages/api/admin/branches.ts
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true }
  });
  res.status(200).json(branches);
}