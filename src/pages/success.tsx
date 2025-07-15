// src/pages/success.tsx

import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import { Alert } from "react-bootstrap";

interface SessionItem {
  calLink: string;
  label:   string;
}

interface SuccessProps {
  items: SessionItem[];
}

export const getServerSideProps: GetServerSideProps<SuccessProps> = async ({ query }) => {
  const sessionId = query.session_id as string;
  if (!sessionId) {
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  // 1) Instanciamos Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-04-30.basil" });

  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  const m = checkout.metadata || {};
  const userId      = m.userId! as string;
  const priceId     = m.priceId! as string;
  const serviceName = m.serviceName! as string;
  const dates       = JSON.parse((m.dates   as string) || "[]") as string[];
  const hours       = JSON.parse((m.hours   as string) || "[]") as string[];

  // 2) Buscar el paquete usando el priceId
  const pkg = await prisma.package.findUnique({
    where: { stripePriceId: priceId },
  });
  if (!pkg) {
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  // 3) Buscar o crear UserPackage
  let userPackage = await prisma.userPackage.findFirst({
    where: { userId, packageId: pkg.id },
  });

  if (!userPackage) {
    userPackage = await prisma.userPackage.create({
      data: {
        userId,
        packageId: pkg.id,
        sessionsRemaining: pkg.sessions,
        paymentSource: "stripe",
      },
    });
  } else {
    // Si ya existía, recarga sesiones
    await prisma.userPackage.update({
      where: { id: userPackage.id },
      data: { sessionsRemaining: pkg.sessions },
    });
  }

  // 4) Selecciona la sucursal (branchId)
  // Si tienes solo una sucursal, selecciona la primera; si tienes un selector, úsalo aquí
  const branch = await prisma.branch.findFirst();
  if (!branch) throw new Error("No hay sucursales definidas");
  const branchId = branch.id;

  // 5) Crea SOLO la cantidad de reservas necesarias (no más)
  const reservations = [];
  const n = pkg.sessions;

  for (let i = 0; i < n; i++) {
    const d = dates[i] ?? dates[0];
    const h = hours[i] ?? hours[0];
    const dt = new Date(d);
    const [hr] = (h || "0").split(":");
    dt.setHours(+hr, 0, 0, 0);

    reservations.push({
      userId,
      packageId: pkg.id,
      date: dt,
      userPackageId: userPackage.id,
      branchId,
      // therapistId: null, // omite o pon null si tu modelo lo permite
      paymentMethod: "stripe",
    });
  }

  // 6) Evita duplicados: crea SOLO si no existen para ese userPackage/fecha/hora
  for (const r of reservations) {
    const exists = await prisma.reservation.findFirst({
      where: {
        userId: r.userId,
        packageId: r.packageId,
        userPackageId: r.userPackageId,
        branchId: r.branchId,
        date: r.date,
      },
    });
    if (!exists) {
      await prisma.reservation.create({ data: r });
    }
  }

  // 7) Monta los enlaces de Google Calendar
  const items: SessionItem[] = reservations.map((r) => {
    const start = r.date;
    const end   = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt   = (x: Date) => x.toISOString().replace(/[-:]|\.\d{3}/g, "");
    return {
      calLink:
        "https://www.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(serviceName)}` +
        `&dates=${fmt(start)}/${fmt(end)}` +
        `&details=${encodeURIComponent(serviceName)}` +
        `&location=${encodeURIComponent(serviceName)}`,
      label: `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
  });

  return { props: { items } };
};

export default function Success({ items }: SuccessProps) {
  return (
    <DashboardLayout>
      <div className="text-center py-5">
        <h1>¡Gracias por tu pago!</h1>
        <Alert variant="success">¡Sesión agendada!</Alert>
        <p>Agrega tus sesiones al calendario:</p>
        <div className="d-flex flex-wrap justify-content-center gap-3 my-4">
          {items.length === 0 && <p>No hay sesiones para agregar.</p>}
          {items.map((it, i) => (
            <a
              key={i}
              href={it.calLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-orange"
            >
              ➕ {it.label}
            </a>
          ))}
        </div>
        <Link href="/dashboard?tab=historial" legacyBehavior>
          <button className="btn btn-secondary">Ver Historial</button>
        </Link>
      </div>
    </DashboardLayout>
  );
}