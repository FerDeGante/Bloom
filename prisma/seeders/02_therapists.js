// prisma/seeders/02_therapists.js
const { prisma } = require("../_utils");

module.exports = async function seedTherapists() {
  const data = ["Jesús Ramírez","Miguel Ramírez","Alitzel Pacheco"];
  for (const name of data) {
    await prisma.therapist.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
};
