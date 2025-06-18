// prisma/seeders/05_clients.js
const bcrypt = require("bcrypt");
const { prisma } = require("../_utils");

module.exports = async function seedClients() {
  const clients = [{ email: "cliente1@ejemplo.com", name: "Cliente Uno", password: "cliente123" },
    { email: "cliente2@ejemplo.com", name: "Cliente Dos", password: "cliente123" },
  ];for (const c of clients) {
    const hash = await bcrypt.hash(c.password, 10);
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email:    c.email,
        name:     c.name,
        password: hash,
        role:     "CLIENTE",
      },
    });
  }
};