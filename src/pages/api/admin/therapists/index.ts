import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    await prisma.$disconnect();
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "ADMIN") {
    await prisma.$disconnect();
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    const { search = "" } = req.query as { search?: string };
    const list = await prisma.therapist.findMany({
      where: {
        user: {
          name: {
            contains: search,
            mode: "insensitive"
          }
        }
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        user: {
          name: "asc"
        }
      }
    });
    
    // Transformar los datos para incluir el name directamente en el objeto therapist
    const transformedList = list.map(therapist => ({
      ...therapist,
      name: therapist.user.name
    }));
    
    const ok = res.status(200).json(transformedList);
    await prisma.$disconnect();
    return ok;
  }

  if (req.method === "POST") {
    const { name, specialty } = req.body as { name: string; specialty?: string };
    
    // Primero crear el usuario
    const user = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@terapeuta.com`, // email temporal
        password: 'temp-password', // contraseña temporal
        role: 'THERAPIST'
      }
    });
    
    // Luego crear el terapeuta asociado
    const ther = await prisma.therapist.create({ 
      data: { 
        userId: user.id,
        specialty 
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    const transformedTherapist = {
      ...ther,
      name: ther.user.name
    };
    
    const ok = res.status(200).json(transformedTherapist);
    await prisma.$disconnect();
    return ok;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  const na = res.status(405).end();
  await prisma.$disconnect();
  return na;
}