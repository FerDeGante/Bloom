// prisma/seeders/01_branches.js
const { prisma } = require("../_utils");

module.exports = async function seedBranches() {
  await prisma.branch.upsert({
    where: { name: "Plaza San Juan" },
    update: {},
    create: {
      name: "Plaza San Juan",
      address: "Avenida San Juan, 77, piso 1, local B, Col. Chapultepec, Cuernavaca, Morelos",
    },
  });

  // Aquí puedes agregar más sucursales en el futuro si es necesario.
  console.log("✅ Seed: Branches");
};