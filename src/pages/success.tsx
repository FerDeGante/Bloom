// src/pages/success.tsx
import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";

interface SuccessProps {
  calLink: string;
}

export const getServerSideProps: GetServerSideProps<SuccessProps> = async ({
  query,
}) => {
  const sessionId = query.session_id as string;
  const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    apiVersion: "2025-04-30.basil",
  });

  // Recupera la sesión de Checkout para leer metadata
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const { metadata } = session;

  // metadata.date es ISO, metadata.hour e metadata.servicio son slugs
  const dateISO = metadata?.date as string;
  const hour = metadata?.hour as string;
  const servicioSlug = metadata?.servicio as string;
  const terapeuta = metadata?.terapeuta as string;

  // Mapeo slug → etiqueta legible
  const serviceNames: Record<string, string> = {
    agua: "Estimulación en agua",
    piso: "Estimulación en piso",
    quiropractica: "Quiropráctica",
    fisioterapia: "Fisioterapia",
    masajes: "Masajes",
    cosmetologia: "Cosmetología",
    "prevencion-lesiones": "Prevención de lesiones",
    "preparacion-fisica": "Preparación física",
    nutricion: "Nutrición",
    "medicina-rehabilitacion": "Medicina en rehabilitación",
    "terpia-post-vacuna": "Terapia post vacuna",
  };
  const servicioLabel =
    serviceNames[servicioSlug] ?? `Cita de ${servicioSlug}`;

  // Calcula start/end en formato YYYYMMDDTHHMMSSZ
  const start = new Date(dateISO);
  const [h, m] = hour.split(":").map(Number);
  start.setHours(h, m, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const dates = `${fmt(start)}/${fmt(end)}`;

  const text = encodeURIComponent(servicioLabel);
  const details = encodeURIComponent(`Terapeuta: ${terapeuta}`);
  const location = encodeURIComponent("Bloom Fisio");

  const calLink = `https://www.google.com/calendar/render` +
    `?action=TEMPLATE` +
    `&text=${text}` +
    `&dates=${dates}` +
    `&details=${details}` +
    `&location=${location}`;

  return { props: { calLink } };
};

export default function Success({ calLink }: SuccessProps) {
  return (
    <DashboardLayout>
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1>¡Gracias por tu pago!</h1>
        <p>Ahora puedes agregar esta cita a tu Google Calendar:</p>
        <a
          href={calLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary my-3"
        >
          ➕ Agregar a Calendar
        </a>
        <div>
          <Link href="/dashboard?tab=reservar" legacyBehavior>
            <button className="btn btn-secondary">← Volver al Dashboard</button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}