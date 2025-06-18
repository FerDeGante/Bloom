const { prisma } = require("../_utils");

module.exports = async function seedServices() {
  const services = [
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
  ];for (const name of services) {
    await prisma.service.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
};