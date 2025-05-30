// prisma/seed.js
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.$connect()


  const paquetes = [
    { id: 'agua_1',         stripePriceId: 'price_1RJd0OFV5ZpZiouCasDGf28F',   name: 'Estimulación temprana en agua',           sessions: 1,  price: 500,  inscription: 30 },
    { id: 'agua_4',         stripePriceId: 'price_1RMBAKFV5ZpZiouCCnrjam5N',   name: 'Estimulación en agua (4×mes)',               sessions: 4,  price: 1400, inscription: 30 },
    { id: 'agua_8',         stripePriceId: 'price_1RMBFKFV5ZpZiouCJ1vHKREU',   name: 'Estimulación en agua (8×mes)',               sessions: 8,  price: 2250, inscription: 30 },
    { id: 'agua_12',        stripePriceId: 'price_1RMBIaFV5ZpZiouC8l6QjW2N',   name: 'Estimulación en agua (12×mes)',              sessions: 12, price: 2500, inscription: 30 },
    { id: 'piso_1',         stripePriceId: 'price_1RJd1jFV5ZpZiouC1xXvllVc',   name: 'Estimulación temprana en piso',              sessions: 1,  price: 500,  inscription: 30 },
    { id: 'piso_4',         stripePriceId: 'price_1RP6S2FV5ZpZiouC6cVpXQsJ',   name: 'Estimulación en piso (4×mes)',               sessions: 4,  price: 1400, inscription: 30 },
    { id: 'piso_8',         stripePriceId: ' price_1RP6SsFV5ZpZiouCtbg4A7OE',   name: 'Estimulación en piso (8×mes)',               sessions: 8,  price: 2250, inscription: 30 },
    { id: 'piso_12',        stripePriceId: 'price_1RP6TaFV5ZpZiouCoG5G58S3',   name: 'Estimulación en piso (12×mes)',              sessions: 12, price: 2500, inscription: 30 },
    { id: 'fisio_1',        stripePriceId: 'price_1RJd3WFV5ZpZiouC9PDzHjKU',   name: 'Fisioterapia (1 sesión)',                     sessions: 1,  price: 500,  inscription: 30 },
    { id: 'fisio_5',        stripePriceId: 'price_1RP6WwFV5ZpZiouCN3m0luq3',   name: 'Fisioterapia (5 sesiones)',                   sessions: 5,  price: 2000, inscription: 30 },
    { id: 'fisio_10',       stripePriceId: 'price_1RP6W9FV5ZpZiouCBXnZwxLW',   name: 'Fisioterapia (10 sesiones)',                  sessions: 10, price: 3000, inscription: 30 },
    { id: 'post_vacuna',    stripePriceId: 'prod_SIyvmx4o5kkTKJ',              name: 'Terapia post vacuna',                         sessions: 1,  price: 500,  inscription: 30 },
    { id: 'quiropractica',  stripePriceId: 'prod_SE5DojRCwzy37u',           name: 'Quiropráctica',                               sessions: 1,  price: 500,  inscription: 30 },
    { id: 'masajes',        stripePriceId: 'prod_SE5EcuLUlnoMo9',           name: 'Masajes',                                     sessions: 1,  price: 500,  inscription: 30 },
    { id: 'cosmetologia',   stripePriceId: 'price_1RQaDGFV5ZpZiouCdNjxrjVk', name: 'Cosmetología',                                sessions: 1,  price: 500,  inscription: 30 },
    { id: 'prevencion_lesiones', stripePriceId: 'price_1RJd57FV5ZpZiouCpcrKNvJV', name: 'Prevención de lesiones',                   sessions: 1,  price: 500,  inscription: 30 },
    { id: 'preparacion_fisica', stripePriceId: 'prod_SE5G5MaqIKWCWe',           name: 'Preparación física',                          sessions: 1,  price: 500,  inscription: 30 },
    { id: 'nutricion',      stripePriceId: 'prod_SE5ISPGdSltSux',           name: 'Nutrición',                                   sessions: 1,  price: 500,  inscription: 30 },
    { id: 'medicina_rehab', stripePriceId: 'prod_SE5JOO0qaMuOKK',           name: 'Medicina en rehabilitación',                  sessions: 1,  price: 500,  inscription: 30 },
  ]

     // Construye un SQL UPSERT masivo
  const values = paquetes.map(p =>
    `('${p.id}','${p.stripePriceId}','${p.name}',${p.sessions},${p.price},${p.inscription})`
  ).join(',')

  const sql = `
    INSERT INTO "Package"
      (id, stripe_price_id, name, sessions, price, inscription)
    VALUES ${values}
    ON CONFLICT (id) DO UPDATE
      SET stripe_price_id = EXCLUDED.stripe_price_id,
          name            = EXCLUDED.name,
          sessions        = EXCLUDED.sessions,
          price           = EXCLUDED.price,
          inscription     = EXCLUDED.inscription;
  `
  await prisma.$executeRawUnsafe(sql)

  console.log(`🎉 Seed completado: ${paquetes.length} paquetes.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })