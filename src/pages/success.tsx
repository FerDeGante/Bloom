// src/pages/success.tsx
import { GetServerSideProps } from "next";
import Stripe from "stripe";
import Link from "next/link";

interface SessionItem { calLink: string; label: string; }

interface SuccessProps { items: SessionItem[]; }

export const getServerSideProps: GetServerSideProps<SuccessProps> = async ({ query }) => {
  const sessionId = query.session_id as string;
  if (!sessionId) {
    return { redirect: { destination: "/dashboard?tab=reservar", permanent: false } };
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-04-30.basil" });
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const m = session.metadata!;

  const dates: string[] = JSON.parse(m.dates as string);
  const hours: string[] = JSON.parse(m.hours as string);
  const label = m.servicio as string; // opcional

  const items = dates.map((d,i) => {
    const [h=0] = hours[i].split(":").map(Number);
    const start = new Date(d); start.setHours(h,0,0);
    const end = new Date(start.getTime()+3600000);
    const fmt = (x:Date)=>x.toISOString().replace(/[-:]|\.\d{3}/g,"");
    const calLink = [
      "https://www.google.com/calendar/render?action=TEMPLATE",
      `&text=${encodeURIComponent(label)}`,
      `&dates=${fmt(start)}/${fmt(end)}`,
      `&details=${encodeURIComponent("Bloom Fisio")}`,
      `&location=${encodeURIComponent("Bloom Fisio")}`,
    ].join("");
    return {
      calLink,
      label: `${start.toLocaleDateString()} • ${start.toLocaleTimeString([], {
        hour:"2-digit", minute:"2-digit"
      })}`
    };
  });

  return { props: { items } };
};

export default function Success({ items }: SuccessProps) {
  return (
    <div className="text-center py-5">
      <h1>¡Gracias por tu pago!</h1>
      <p>Agrega tus sesiones al calendario:</p>
      {items.map((it,i)=>(
        <div key={i} className="mb-3">
          <p><strong>Sesión {i+1}:</strong> {it.label}</p>
          <a
            href={it.calLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-orange mb-2"
          >
            ➕ Agregar al Calendario
          </a>
        </div>
      ))}
      <Link href="/dashboard?tab=historial" legacyBehavior>
        <button className="btn btn-orange mt-4">Ver Historial</button>
      </Link>
    </div>
  );
}