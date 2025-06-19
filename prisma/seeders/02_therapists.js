// prisma/seeders/02_therapists.js
const bcrypt = require("bcrypt");
const { prisma } = require("../_utils");

module.exports = async function seedTherapists() {
  const therapists = [
    { name: "Jesús Ramírez",   email: "jesus.ramirez@bloom.com"   },
    { name: "Miguel Ramírez",  email: "miguel.ramirez@bloom.com"  },
    { name: "Alitzel Pacheco", email: "alitzel.pacheco@bloom.com" },
  ];

  for (const { name, email } of therapists) {
    // 1) Upsert del usuario con rol THERAPIST
    const passwordHash = await bcrypt.hash("bloomTherapist123", 10);
    const user = await prisma.user.upsert({
      where:  { email },
      update: { name, password: passwordHash, role: "THERAPIST" },
      create: { name, email, password: passwordHash, role: "THERAPIST" },
    });

    // 2) Ahora upserteamos el Therapist usando el campo único userId
    await prisma.therapist.upsert({
      where:  { userId: user.id },     // <<< aquí UserId es @unique
      update: { isActive: true },
      create: {
        userId:   user.id,
        specialty: null,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seed: ${therapists.length} therapists creados y vinculados.`);
};