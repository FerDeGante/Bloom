import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("bloomadmin25", 10);
  await prisma.user.upsert({
    where: { email: "ferdegante.22@gmail.com" },
    update: {},
    create: {
      email: "ferdegante.22@gmail.com",
      name: "Fernando De Gante",
      password: hashed,
      role: "ADMIN",
    },
  });

  const therapistsData = [
    { name: "Jesús Ramírez", specialty: "Pediatría" },
    { name: "Miguel Ramírez", specialty: "Ortopedia" },
    { name: "Alitzel Pacheco", specialty: "Neurología Pediátrica" },
  ];
  for (const t of therapistsData) {
    await prisma.therapist.upsert({
      where: { name: t.name },
      update: { specialty: t.specialty, isActive: true },
      create: { name: t.name, specialty: t.specialty },
    });
  }

  const services = [
    { name: "Estimulación en agua (1×mes)" },
    { name: "Estimulación en piso (1×mes)" },
    { name: "Fisioterapia (1×mes)" },
  ];
  for (const s of services) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name },
    });
  }

  const packagesData = [
    {
      name: "Estimulación en agua (1×mes)",
      stripePriceId: "price_1RJd0OFV5pZiouCasDGf28F",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Estimulación en agua (4×mes)",
      stripePriceId: "price_1RMBAKFV5pZiouCCnrjam5N",
      sessions: 4,
      price: 1400,
      inscription: 30,
    },
    {
      name: "Fisioterapia (1×mes)",
      stripePriceId: "price_1RJd3WFV5pZiouC9PDzHjKU",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
  ];
  for (const p of packagesData) {
    await prisma.package.upsert({
      where: { stripePriceId: p.stripePriceId },
      update: {},
      create: {
        name: p.name,
        stripePriceId: p.stripePriceId,
        sessions: p.sessions,
        price: p.price,
        inscription: p.inscription,
      },
    });
  }

  const clientsData = [
    { email: "cliente1@ejemplo.com", name: "Cliente Uno", phone: "555-1001", password: "cliente123" },
    { email: "cliente2@ejemplo.com", name: "Cliente Dos", phone: "555-1002", password: "cliente123" },
  ];
  for (const c of clientsData) {
    const pass = await bcrypt.hash(c.password, 10);
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        name: c.name,
        phone: c.phone,
        password: pass,
        role: "CLIENTE",
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
