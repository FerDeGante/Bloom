
# Bloom

Bloom es una plataforma de gestión de reservas y pagos para servicios terapéuticos. Está construida con Next.js, Prisma, NextAuth y Stripe, y permite:

* **Usuarios (clientes)** : registrarse, comprar paquetes, agendar y pagar sesiones por adelantado (Stripe) o en efectivo (front desk), visualizar histórico de reservas y agregar sesiones a Google Calendar.
* **Administradores** : gestionar clientes, terapeutas, servicios, reservas y registrar pagos en efectivo directamente desde el panel de administración.

---

## 📁 Estructura del repositorio

/.
├── prisma/
│   ├── migrations/       ← Carpetas y archivos de migraciones generados por Prisma
│   ├── schema.prisma     ← Definición del esquema de base de datos
│   └── seed.js           ← Script de “seed” que crea datos iniciales (admin, terapeutas, servicios, paquetes, clientes de prueba)
│
├── public/
│   └── images/           ← Imágenes estáticas (logos, fotos de servicios, etc.)
│
├── src/
│   ├── components/       ← Componentes React (DashboardLayout, Navbar, Formularios, etc.)
│   │   ├── dashboard/
│   │   │   ├── AccountSection.tsx
│   │   │   ├── HistorySection.tsx
│   │   │   ├── PackagesSection.tsx
│   │   │   ├── PurchasedPackagesSection.tsx
│   │   │   ├── ReservarPaquete.tsx
│   │   │   └── (...otros componentes relacionados al dashboard de usuario)
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── lib/
│   │   ├── prisma.ts      ← Cliente Prisma configurado (export default PrismaClient)
│   │   └── packages.ts    ← Definición de los paquetes disponibles (id, title, sessions, priceId, etc.)
│   │
│   ├── pages/
│   │   ├── api/
│   │   │   ├── dashboard/
│   │   │   │   └── packages.ts      ← Endpoint que devuelve paquetes adquiridos por el usuario
│   │   │   ├── appointments/
│   │   │   │   └── history.ts        ← Histórico de reservas del cliente
│   │   │   ├── stripe/
│   │   │   │   └── checkout.ts       ← Crea sesión de pago en Stripe
│   │   │   └── (...otros endpoints REST)
│   │   ├── dashboard.tsx             ← Página principal del dashboard de usuario
│   │   ├── success.tsx               ← Página a la que Stripe redirige tras pago exitoso
│   │   ├── index.tsx                 ← Landing page o página pública
│   │   ├── login.tsx                 ← Página de autenticación
│   │   └── (...otras páginas Next.js)
│   │
│   ├── styles/                       ← Archivos CSS / SCSS globales
│   └── utils/                        ← Funciones auxiliares (formateo de fechas, etc.)
│
├── .env.example                      ← Ejemplo de variables de entorno
├── .eslintrc.js                      ← Configuración de ESLint con reglas de Next.js
├── next.config.mjs                   ← Configuración de Next.js (sin la clave “api”)
├── netlify.toml                      ← Configuración para deploy en Netlify
├── package.json
├── prisma.schema                     ← Prisma schema (alias a prisma/schema.prisma)
└── README.md                         ← Este archivo


## 🚀 Comenzando (Instalación y configuración)

### Requisitos previos

* **Node.js** ≥ 18 (recomendado 20+), junto con npm ≥ 8 o yarn ≥ 1.22.
* **PostgreSQL** (o una base PostgreSQL en la nube, p. ej. Neon).
* Cuenta en **Stripe** para obtener las claves (`STRIPE_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
* Cuenta en **NextAuth** (opcionalmente usando Google, GitHub, correo/contraseña).
* (Opcional) Cuenta en **Netlify** si se desplegará allí.

### 1. Clonar el repositorio

```
git clone https://github.com/tu-usuario/bloom.git
cd bloom
```

### 2 Instalar dependencias

```
npm install
```

Ó, si usas Yarn:

```
yarn install
```


### 3. Variables de entorno

Copia el archivo de ejemplo:

```
cp .env.example .env
```

Y edita `.env` para incluir tus credenciales:

```
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/NOMBRE_DB?schema=public"
NEXTAUTH_SECRET="una-clave-larga-y-secreta-aleatoria"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_BASE="http://localhost:3000"
STRIPE_SECRET="sk_test_…"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_…"
```


* `DATABASE_URL`: Conexión a PostgreSQL (cambia según tu entorno).
* `NEXTAUTH_SECRET`: Secreto para firmar cookies de autenticación.
* `NEXTAUTH_URL`: Debe apuntar a la URL donde corre la aplicación (p. ej. `http://localhost:3000`).
* `NEXT_PUBLIC_APP_BASE`: Base URL pública (usada para links a calendario, webhooks, etc.).
* `STRIPE_SECRET`: Clave privada de Stripe.
* `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Clave pública de Stripe.




### 4. Generar Prisma Client

npm run generate

Esto lee `prisma/schema.prisma` y genera `node_modules/@prisma/client`.

### 5. Ejecutar migraciones al esquema (solo en desarrollo)

npm run migrate


* Con este comando Prisma aplicará todas las migraciones pendientes en `prisma/migrations/*` a tu base de datos local.
* Si es la primera vez, generará las tablas según `schema.prisma`.

### 6. “Seed” de datos iniciales

Tras aplicar migraciones, crea datos de prueba (usuario admin, terapeutas, servicios, paquetes, clientes):

npm run seed


* El script `prisma/seed.js` se encarga de:
  1. Crear o actualizar un usuario con email `ferdegante.22@gmail.com` y contraseña `bloomadmin25` con rol `ADMIN`.
  2. Crear los terapeutas predefinidos si no existen.
  3. Crear los servicios (solo nombre).
  4. Hacer upsert de los paquetes (nombre, `stripePriceId`, sesiones, precio, inscripción).
  5. Crear clientes de prueba (rol `CLIENTE` y contraseñas hasheadas).

Verifica en consola:

✅ Seed completado correctamente.


### 7. Levantar servidor en modo desarrollo

npm run dev


* Arranca Next.js en `http://localhost:3000` con Turbopack (hot reload muy rápido).
* Abre el navegador en `http://localhost:3000` para ver la página de aterrizaje.
* El Dashboard de usuario queda en `http://localhost:3000/dashboard`.
* El Dashboard de admin estará en `http://localhost:3000/admin` (si ya está implementado).


## 📜 Scripts disponibles

En `package.json` encontrarás:


    

| Comando              | Descripción                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`      | Arranca Next.js en modo desarrollo (`next dev --turbopack`). Hot reload + herramientas de DevTools.                                    |
| `npm run migrate`  | Ejecuta `prisma migrate dev`para aplicar migraciones en tu base de datos (en local).                                                   |
| `npm run generate` | Ejecuta `prisma generate`para (re)generar Prisma Client tras cambios en el esquema.                                                    |
| `npm run build`    | Produce el build de Next.js para producción (`next build`).                                                                           |
| `npm run start`    | Arranca el servidor en modo producción (`next start`).                                                                                |
| `npm run lint`     | Ejecuta el linter de Next.js (`next lint`). Asegúrate de tener instalado `eslint-plugin-next`.                                      |
| `npm run seed`     | Ejecuta `node prisma/seed.js`para “sembrar” datos iniciales en la base (admin, terapeutas, servicios, paquetes, clientes de prueba). |




## 🔧 Configuración de ESLint / Next.js

* El proyecto usa **ESLint** con la configuración oficial de Next.js (`eslint-config-next` y `eslint-plugin-next`).
* Asegúrate de tenerlo instalado en `devDependencies`:

  "devDependencies": {
  "eslint": "^9.x.x",
  "eslint-config-next": "15.3.0",
  "eslint-plugin-next": "^0.x.x"
  }

  Tu `.eslintrc.js` (o `.eslintrc.json`) debería verse así:
* // .eslintrc.js
  module.exports = {
  root: true,
  extends: [
  "eslint:recommended",
  "plugin:react/recommended",
  "next",                // Reglas recomendadas de Next.js
  "next/core-web-vitals" // Reglas enfocadas en rendimiento y Core Web Vitals
  ],
  parserOptions: {
  ecmaVersion: 2022,
  sourceType: "module",
  ecmaFeatures: {
  jsx: true
  }
  },
  settings: {
  react: {
  version: "detect"
  }
  },
  rules: {
  // Aquí van tus reglas personalizadas (p. ej. desactivar error de useEffect)
  },
  };

* El script `"lint": "next lint"` lee automáticamente `next.config.mjs` y las reglas de React/Next.

## 🗄  Base de datos & Prisma

1. **`prisma/schema.prisma`** : define modelos para `User`, `Account`, `Session`, `VerificationToken`, `Service`, `Therapist`, `Reservation`, `Package` y `UserPackage`.
2. **Migraciones** : cada cambio en `schema.prisma` genera una nueva carpeta en `prisma/migrations/<timestamp>_<nombre>/migration.sql`.
3. **Client** : `PrismaClient` se exporta en `src/lib/prisma.ts` para usarlo en API routes y SSR.

### Ejemplo breve de `schema.prisma`


datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  password  String
  role      String    @default("CLIENTE")

  accounts     Account[]
  sessions     Session[]
  reservations Reservation[]
  packages     UserPackage[]
}

model Service {
  id           String        @id @default(cuid())
  name         String        @unique
  reservations Reservation[]
}

model Therapist {
  id           String        @id @default(cuid())
  name         String        @unique
  reservations Reservation[]
}

model Reservation {
  id          String    @id @default(cuid())
  userId      String
  serviceId   String
  therapistId String
  date        DateTime
  createdAt   DateTime  @default(now())

  user       User      @relation(fields: [userId], references: [id])
  service    Service   @relation(fields: [serviceId], references: [id])
  therapist  Therapist @relation(fields: [therapistId], references: [id])
}

model Package {
  id            String       @id @default(cuid())
  stripePriceId String       @unique @map("stripe_price_id")
  name          String
  sessions      Int
  price         Int
  inscription   Int
  userPackages  UserPackage[]
}

model UserPackage {
  id                String   @id @default(cuid())
  userId            String
  pkgId             String
  sessionsRemaining Int
  createdAt         DateTime @default(now())

  user User    @relation(fields: [userId], references: [id])
  pkg  Package @relation(fields: [pkgId], references: [id])

  @@unique([userId, pkgId])
}


## 🎨 Diseño UI / UX

1. **Dashboard de Usuario** (`/dashboard`):
   * Barra de navegación superior con pestañas:
     * **Mi cuenta** : ver y editar datos personales.
     * **Mis paquetes** : lista de `UserPackage` con “Agendar sesión” en cada tarjeta.
     * **Mis reservaciones** : tabla con fecha, hora, servicio, terapeuta, y opción de editar (cambiar fecha/hora).
     * **Reservar** : vista de todos los paquetes disponibles, agrupados (agua, piso, fisioterapia, otros).
   * Botones naranjas (“btn-orange”) para llamadas a la acción: “Comprar paquete”, “Agendar sesión”, “Confirmar y pagar”.
   * Al finalizar pago, página `success.tsx` muestra enlaces para agregar a Google Calendar.
2. **Dashboard de Admin** (`/admin`):
   * Sidebar o pestañas laterales con secciones:
     * **Clientes** : tabla de usuarios (email, nombre, rol), opción para editar o crear cliente manualmente.
     * **Terapeutas** : lista de terapeutas registrados; agregar / editar datos (nombre, especialidad, activo/inactivo).
     * **Servicios** : CRUD de servicios (nombre).
     * **Paquetes** : CRUD de paquetes (nombre, `stripePriceId`, sesiones, precio, inscripción).
     * **Reservaciones** : calendario (FullCalendar o React-Calendar) que muestre todas las reservas con filtro por terapeuta, fecha, cliente. Hacer click en un hueco para crear cita manual (pago en efectivo).
     * **Reportes** : resumen de ventas (Stripe + efectivo), sesiones agendadas, clientes registrados.
   * Formularios claros, validaciones (Bootstrap + React Hook Form / Formik).
   * Tablas responsivas (React-Bootstrap Table) con paginación y búsquedas.
   * Usar **FullCalendar** para vista de mes/semana/día de reservaciones.
   * Modal para registrar cita a cliente (seleccionar cliente existente o crear nuevo, seleccionar servicio, terapeuta, fecha/hora, método de pago).

> **Nota** : Para el admin, la implementación típica sería:
>
> * Ruta: `/pages/admin/index.tsx` (o `/app/admin/page.tsx` si usas App Router).
> * Autorización: en `getServerSideProps` o con middleware, verificar `session.user.role === "ADMIN"`.
> * Componentes:
>   * `<AdminNavbar />`
>   * `<Sidebar />`
>   * `<AdminClients />`, `<AdminTherapists />`, `<AdminServices />`, `<AdminPackages />`, `<AdminCalendar />`, `<AdminReports />`

---

## 🔄 Flujo de Trabajo: Agendar + Pago

1. **Usuario elige paquete** :

* En “Reservar” (`PackagesSection`), al hacer clic en “Comprar → Agendar” se redirige con query:
  /dashboard?view=reservar-paquete&type=`<pkgId>`&sessions=`<n>`&priceId=`<priceId>`&title=<TítuloDelPaquete>

1. **ReservarPaquete** muestra un wizard de pasos (1…n): para cada sesión elegir:
   * Terapeuta (selector desplegable).
   * Fecha (React Calendar, bloquea domingos).
   * Hora (botones para franja horaria válida).
   * “Siguiente” hasta llegar al resumen.
2. **Resumen** : lista todas las sesiones seleccionadas con terapeuta y slot.

* Botón “Confirmar y pagar” → llama a `/api/stripe/checkout`, pasa `priceId` y `metadata` con arrays de fechas, horas y terapeutas.

1. **Stripe Checkout** → cliente paga en Stripe.
2. **Webhook (opcional)** → se registra el pago y convierte metadata a reservas con Prisma (upsert service, upsert terapeutas, crear userPackage, crear reservations).
3. **Página `Success`** : muestra enlaces “➕ 2025-06-15 10:00” (links a Google Calendar).
4. **Usuario** : en “Mis reservaciones” aparece la tabla con nuevas reservas; en “Mis paquetes” se refleja el paquete nuevo con sesiones restantes (para pagos en efectivo, se registra manualmente desde Admin).

---

## 🛠 Configurar pagos en efectivo (Front Desk)

Actualmente Bloom solo maneja pagos con Stripe. Para pagos en efectivo:

1. **En Dashboard de Usuario** no se ofrecerá opción de “Pagar en efectivo” (solo Stripe).
2. **En Dashboard de Admin** habrá un formulario en “Reservaciones” o “Clientes” que permita:
   * Seleccionar un cliente existente (por correo) o crear uno nuevo.
   * Seleccionar un paquete (`pkgId`) y número de sesiones.
   * Calcular precio total (precio paquete × cantidad).
   * Registrar el pago manualmente (no Stripe).
   * Crear registros en la base:
     * Crear o upsert de `UserPackage` para ese cliente (igual que con Stripe → sessionsRemaining = `pkg.sessions`).
     * Crear `Reservation`.
3. **Implementación** (en `/pages/admin/calendar.tsx` o similar):
   * Al hacer clic en un hueco del calendario, se abre un modal: “¿Registrar cita para cliente?” → formulario con: email del cliente, paquete (desplegable), terapeuta, fecha, hora, método de pago (Stripe/Efectivo).
   * Si “Stripe”: se redirige a `ReservarPaquete`.
   * Si “Efectivo”: se ejecuta directamente un PUT/POST a `/api/admin/manual-reservation` que realiza el upsert de `UserPackage` + `Reservation`.
4. **Endpoint `/api/admin/manual-reservation.ts`** (Next.js API Route):
   * Recibe JSON `{ userEmail, pkgId, therapistId, date, hour, pago: "efectivo" }`.
   * Verifica o crea el usuario (o asumir ya existe).
   * Upsert `UserPackage` (igual que el flujo Stripe).
   * Crea `Reservation`.
   * Retorna `{ success: true }`.

---

## 👉 Ejemplos de comandos comunes

Desde la raíz del proyecto:


```
1.Instalar dependencias
npm install
2. Generar Prisma Client
npm run generate
3. Aplicar migracionesnpm run migrate
4. “Sembrar” datos iniciales (admin + datos de prueba)npm run seed
5. Correr en modo desarrollonpm run dev
6. Compilar para producciónnpm run build
7. Levantar servidor de producciónnpm run start
8. Ejecutar linternpm run lint
```


Si algo falla, primero asegúrate de que:

* Tienes un archivo `.env` correctamente configurado.
* Tu base de datos PostgreSQL está accesible desde `DATABASE_URL`.
* Instalaste correctamente `eslint-plugin-next` y `next` (para que `npm run lint` no rompa).
* Ejecutaste `npm run migrate` antes de `npm run seed`.


## ✔️ Resumen de flujo de instalación

1. Clonar repo
2. `npm install`
3. Copiar y editar `.env`
4. `npm run generate`
5. `npm run migrate`
6. `npm run seed`
7. `npm run dev`

¡Listo! Ahora Bloom debería correr en [http://localhost:3000](http://localhost:3000). Accede con:

* **Admin** : email `ferdegante.22@gmail.com` / contraseña `bloomadmin25`.
* **Usuarios de prueba** : `cliente1@ejemplo.com` / `cliente123`, `cliente2@ejemplo.com` / `cliente123`.

---

## 📖 Recursos adicionales

* **Prisma**
  * Docs: [https://www.prisma.io/docs/]()
  * Migrations: [https://pris.ly/d/migrate]()
* **Next.js**
  * Docs: [https://nextjs.org/docs](https://nextjs.org/docs)
  * Deploy en Netlify: [https://nextjs.org/docs/deployment#netlify]()
* **NextAuth.js**
  * Docs: [https://next-auth.js.org/]()
* **Stripe**
  * Docs: [https://stripe.com/docs/payments/checkout](https://stripe.com/docs/payments/checkout)
  * Webhooks: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
* **React-Bootstrap**
  * Docs: [https://react-bootstrap.github.io/]()
* **React-Calendar**
  * Docs: [https://github.com/wojtekmaj/react-calendar](https://github.com/wojtekmaj/react-calendar)

¡Feliz desarrollo con Bloom!
