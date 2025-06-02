// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1) Crear o actualizar el usuario admin
  const adminPassword = await bcrypt.hash("bloomadmin25", 10);
  await prisma.user.upsert({
    where: { email: "ferdegante.22@gmail.com" },
    update: {
      // No necesitamos actualizar campos excepto rol en caso de que ya existiera
      role: "ADMIN",
    },
    create: {
      email: "ferdegante.22@gmail.com",
      name: "Fernando De Gante",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // 2) Crear terapeutas (solo nombre, porque en tu esquema Therapist no tiene specialty ni isActive)
  const therapistsData = [
    { name: "Jesús Ramírez" },
    { name: "Miguel Ramírez" },
    { name: "Alitzel Pacheco" },
  ];
  for (const t of therapistsData) {
    // Primero buscamos si ya existe por nombre
    const existing = await prisma.therapist.findFirst({ where: { name: t.name } });
    if (!existing) {
      await prisma.therapist.create({
        data: {
          name: t.name,
        },
      });
    }
  }

  // 3) Crear servicios (solo name, porque en tu esquema Service no tiene ningún otro campo adicional)
  const servicesData = [
    { name: "Estimulación en agua (1×mes)" },
    { name: "Estimulación en agua (4×mes)" },
    { name: "Estimulación en agua (8×mes)" },
    { name: "Estimulación en agua (12×mes)" },
    { name: "Estimulación en piso (1×mes)" },
    { name: "Estimulación en piso (4×mes)" },
    { name: "Estimulación en piso (8×mes)" },
    { name: "Estimulación en piso (12×mes)" },
    { name: "Fisioterapia (1×mes)" },
    { name: "Fisioterapia (5×mes)" },
    { name: "Fisioterapia (10×mes)" },
    { name: "Terapia post vacuna" },
    { name: "Quiropráctica" },
    { name: "Masajes" },
    { name: "Cosmetología" },
    { name: "Prevención de lesiones" },
    { name: "Preparación física" },
    { name: "Nutrición" },
    { name: "Medicina en rehabilitación" },
  ];
  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.service.create({
        data: {
          name: s.name,
        },
      });
    }
  }

  // 4) Crear paquetes (aquí sí usamos upsert porque stripePriceId es UNIQUE en el esquema)
  const packagesData = [
    {
      name: "Estimulación en agua (1×mes)",
      stripePriceId: "price_1RJd0OFV5ZpZiouCasDGf28F",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Estimulación en agua (4×mes)",
      stripePriceId: "price_1RMBAKFV5ZpZiouCCnrjam5N",
      sessions: 4,
      price: 1400,
      inscription: 30,
    },
    {
      name: "Estimulación en agua (8×mes)",
      stripePriceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU",
      sessions: 8,
      price: 2250,
      inscription: 30,
    },
    {
      name: "Estimulación en agua (12×mes)",
      stripePriceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N",
      sessions: 12,
      price: 2500,
      inscription: 30,
    },
    {
      name: "Estimulación en piso (1×mes)",
      stripePriceId: "price_1RJd1jFV5ZpZiouC1xXvllVc",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Estimulación en piso (4×mes)",
      stripePriceId: "price_1RP6S2FV5ZpZiouC6cVpXQsJ",
      sessions: 4,
      price: 1400,
      inscription: 30,
    },
    {
      name: "Estimulación en piso (8×mes)",
      stripePriceId: "price_1RP6SsFV5ZpZiouCtbg4A7OE",
      sessions: 8,
      price: 2250,
      inscription: 30,
    },
    {
      name: "Estimulación en piso (12×mes)",
      stripePriceId: "price_1RP6TaFV5ZpZiouCoG5G58S3",
      sessions: 12,
      price: 2500,
      inscription: 30,
    },
    {
      name: "Fisioterapia (1×mes)",
      stripePriceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Fisioterapia (5×mes)",
      stripePriceId: "price_1RP6WwFV5ZpZiouCN3m0luq3",
      sessions: 5,
      price: 2000,
      inscription: 30,
    },
    {
      name: "Fisioterapia (10×mes)",
      stripePriceId: "price_1RP6W9FV5ZpZiouCBXnZwxLW",
      sessions: 10,
      price: 3000,
      inscription: 30,
    },
    {
      name: "Terapia post vacuna",
      stripePriceId: "price_1ROMxFFV5ZpZiouCdkM2KoHF",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Quiropráctica",
      stripePriceId: "price_1RJd2fFV5ZpZiouCsaJNkUTO",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Masajes",
      stripePriceId: "price_1RJd4JFV5ZpZiouCPjcpX3Xn",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Cosmetología",
      stripePriceId: "price_1RQaDGFV5ZpZiouCdNjxrjVk",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Prevención de lesiones",
      stripePriceId: "price_1RJd57FV5ZpZiouCpcrKNvJV",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Preparación física",
      stripePriceId: "price_1RJd6EFV5ZpZiouCYwD4J3I8",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Nutrición",
      stripePriceId: "price_1RJd7qFV5ZpZiouCbj6HrFJF",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
    {
      name: "Medicina en rehabilitación",
      stripePriceId: "price_1RJd9HFV5ZpZiouClVlCujAm",
      sessions: 1,
      price: 500,
      inscription: 30,
    },
  ];
  for (const p of packagesData) {
    await prisma.package.upsert({
      where: { stripePriceId: p.stripePriceId },
      update: {
        // no actualizaciones adicionales por ahora
      },
      create: {
        name: p.name,
        stripePriceId: p.stripePriceId,
        sessions: p.sessions,
        price: p.price,
        inscription: p.inscription,
      },
    });
  }

  // 5) Crear algunos clientes de prueba para hacer reservas
  const clientsData = [
    { email: "cliente1@ejemplo.com", name: "Cliente Uno", password: "cliente123" },
    { email: "cliente2@ejemplo.com", name: "Cliente Dos", password: "cliente123" },
  ];
  for (const c of clientsData) {
    // Generamos el hash de la contraseña
    const hashed = await bcrypt.hash(c.password, 10);
    await prisma.user.upsert({
      where: { email: c.email },
      update: {
        // nada que actualizar necesariamente
      },
      create: {
        email: c.email,
        name: c.name,
        password: hashed,
        role: "CLIENTE",
      },
    });
  }

  console.log("✅ Seed finalizado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

