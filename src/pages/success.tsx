// src/pages/success.tsx
import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

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
    return {
      redirect: { destination: "/dashboard?tab=reservar", permanent: false },
    };
  }

  // Recuperar la sesión de Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-04-30.basil" });
  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  const m = checkout.metadata || {};

  // Metadata
  const serviceName = m.serviceName || "Tu servicio";
  const dates       = JSON.parse((m.dates as string) || "[]") as string[];
  const hours       = JSON.parse((m.hours as string) || "[]") as string[];

  // Construir enlaces a Google Calendar
  const items: SessionItem[] = dates.map((d, i) => {
    const start = new Date(d);
    const h = parseInt(hours[i] || "0", 10);
    start.setHours(h, 0, 0, 0);
    const end = new Date(start.getTime() + 3600 * 1000);
    const fmt = (x: Date) => x.toISOString().replace(/[-:]|\.\d{3}/g, "");
    return {
      calLink:
        "https://www.google.com/calendar/render?action=TEMPLATE" +
        `&text=${encodeURIComponent(serviceName)}` +
        `&dates=${fmt(start)}/${fmt(end)}` +
        `&details=${encodeURIComponent(serviceName)}` +
        `&location=${encodeURIComponent(serviceName)}`,
      label: `${start.toLocaleDateString()} • ${start
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .toLowerCase()}`,
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
