// src/pages/api/admin/therapists/[therapistId]/availability.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions }      from "@/pages/api/auth/[...nextauth]";
import prisma                from "@/lib/prisma";

const ALL_HOURS = [9,10,11,12,13,14,15,16,17,18];

export default async function handler(req:NextApiRequest, res:NextApiResponse<string[]|{error:string}>) {
  const session = await getServerSession(req,res,authOptions);
  if(!session?.user?.id) return res.status(401).json({ error:"Unauthorized" });

  const { date } = req.query as { date?:string };
  if(req.method!=="GET"||!date) return res.status(400).json({ error:"Missing date" });

  // Si no hay terapeuta en manual, devolvemos todo
  const therapistId = req.query.therapistId;
  if(!therapistId || therapistId==="any") {
    return res.status(200).json(ALL_HOURS.map(h=>String(h).padStart(2,"0")+":00"));
  }

  // Si viene ID real, filtramos ocupadas
  const start = new Date(`${date}T00:00:00`);
  const end   = new Date(start);
  end.setDate(end.getDate()+1);
  const reservas = await prisma.reservation.findMany({
    where: { therapistId: String(therapistId), date:{ gte:start, lt:end } },
    select: { date:true }
  });
  const ocup = new Set(reservas.map(r=>r.date.getHours()));
  let libres = ALL_HOURS.filter(h=>!ocup.has(h));
  // quitamos pasadas si es hoy
  if(date===new Date().toISOString().slice(0,10)) {
    const ahora=new Date().getHours();
    libres=libres.filter(h=>h>ahora);
  }
  return res.status(200).json(libres.map(h=>String(h).padStart(2,"0")+":00"));
}
