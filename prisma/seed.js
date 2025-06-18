// prisma/seed.js
require("dotenv").config();
const seedUsers       = require("./seeders/01_users");
const seedTherapists  = require("./seeders/02_therapists");
const seedServices    = require("./seeders/03_services");
const seedPackages    = require("./seeders/04_packages");
const seedClients     = require("./seeders/05_clients");

async function main() {
  console.log("🌱 Iniciando seed...");
  await seedUsers();
  await seedTherapists();
  await seedServices();
  await seedPackages();
  await seedClients();
  console.log("✅ Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // cierra conexión
    const { prisma } = require("./_utils");
    await prisma.$disconnect();
  });
