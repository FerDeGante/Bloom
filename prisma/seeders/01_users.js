// prisma/seeders/01_users.js
const bcrypt = require("bcrypt");
const { prisma } = require("../_utils");

module.exports = async function seedUsers() {
  const hash = await bcrypt.hash("bloomadmin25", 10);
  await prisma.user.upsert({
    where: { email: "ferdegante.22@gmail.com" },
    update: { role: "ADMIN", password: hash },
    create: {
      email:    "ferdegante.22@gmail.com",
      name:     "Fernando De Gante",
      password: hash,
      role:     "ADMIN",
    },
  });
};
