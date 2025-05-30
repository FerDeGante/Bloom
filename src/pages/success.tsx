// src/pages/success.tsx
import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";

interface SessionItem {
  calLink: string;
  label: string;
}
interface SuccessProps {
  items: SessionItem[];
}

export const getServerSideProps: GetServerSideProps<SuccessProps> = async ({ query }) => {
  const sessionId = query.session_id as string;
  if (!sessionId) {
    // Si no hay session_id, redirigimos de vuelta al dashboard/reservar
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  // 0) Instanciamos Stripe con tu secret key
  const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2025-04-30.basil",
  });

  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err: any) {
    console.error("Error fetching Stripe session:", err);
    // En caso de fallo, redirigimos también
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  const m = checkout.metadata || {};

  // 1) Extraemos de metadata toda la info
  const userId        = m.userId! as string;
  const serviceId     = m.serviceId! as string;
  const priceId       = m.priceId! as string;
  const serviceName   = m.serviceName! as string;
  const dates         = JSON.parse((m.dates as string)  || "[]") as string[];
  const hours         = JSON.parse((m.hours as string)  || "[]") as string[];
  const therapistIds  = JSON.parse((m.therapistIds as string)  || "[]") as string[];
  const therapistNames= JSON.parse((m.therapistNames as string)  || "[]") as string[];

  // 2) Upsert Service
  await prisma.service.upsert({
    where: { id: serviceId },
    update: { name: serviceName },
    create: { id: serviceId, name: serviceName },
  });

  // 3) Upsert Therapists
  for (let i = 0; i < therapistIds.length; i++) {
    await prisma.therapist.upsert({
      where: { id: therapistIds[i] },
      update: { name: therapistNames[i] },
      create: { id: therapistIds[i], name: therapistNames[i] },
    });
  }

  // 4) Upsert UserPackage (si compró un paquete)
  const pkg = await prisma.package.findUnique({ where: { stripePriceId: priceId } });
  if (pkg) {
    await prisma.userPackage.create({
      data: {
        userId,
        pkgId: pkg.id,
        sessionsRemaining: pkg.sessions,
      },
    });
  }

  // 5) Crear Reservations
  const recs = dates.map((d, i) => {
    const dt = new Date(d);
    const [h = "0"] = (hours[i] || "0").split(":");
    dt.setHours(parseInt(h, 10), 0, 0, 0);
    return {
      userId,
      serviceId,
      therapistId: therapistIds[i],
      date: dt,
    };
  });
  if (recs.length) {
    await prisma.reservation.createMany({
      data: recs,
      skipDuplicates: true,
    });
  }

  // 6) Generar enlaces de Google Calendar
  const items: SessionItem[] = recs.map((r) => {
    const start = r.date;
    const end = new Date(start.getTime() + 3600 * 1000);
    const fmt = (x: Date) => x.toISOString().replace(/[-:]|\.\d{3}/g, "");
    return {
      calLink:
        "https://www.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(serviceName)}` +
        `&dates=${fmt(start)}/${fmt(end)}` +
        `&details=${encodeURIComponent(serviceName)}` +
        `&location=${encodeURIComponent(serviceName)}`,
      label: `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    };
  });

  return { props: { items } };
};

export default function Success({ items }: SuccessProps) {
  return (
    <DashboardLayout>
      <div className="text-center py-5">
        <h1>¡Gracias por tu pago!</h1>
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
