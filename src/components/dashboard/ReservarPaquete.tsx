// src/components/dashboard/ReservarPaquete.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Button,
  Alert,
  ListGroup,
  Spinner,
  Form,
} from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";

// Mapea cada priceId al serviceId real en tu BD
const priceToServiceId: Record<string, string> = {
  price_1RJd0OFV5ZpZiouCasDGf28F: "svc_water_1",
  // … agrega el mapeo real …
};

const therapistList = [
  { id: "ther_1", name: "Jesús Ramírez" },
  { id: "ther_2", name: "Miguel Ramírez" },
  // …
];

interface Props {
  type: string;
  sessions: number;
  priceId: string;
}

interface Slot { date: Date | null; hora: number | null; therapistId: string; }

export default function ReservarPaquete({ type, sessions, priceId }: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: sessions }, () => ({ date: null, hora: null, therapistId: "" }))
  );
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");

  const now = new Date();
  const maxDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const thisSlot = slots[current];
  const done = slots.filter(s => s.date && s.hora !== null && s.therapistId).length;

  const updateSlot = (data: Partial<Slot>) =>
    setSlots(s => {
      const nxt = [...s];
      nxt[current] = { ...nxt[current], ...data };
      return nxt;
    });

  const next = () => {
    if (!thisSlot.therapistId) return setError("Selecciona un terapeuta");
    if (!thisSlot.date || thisSlot.hora === null) return setError("Elige fecha y hora");
    setError("");
    setCurrent(c => Math.min(c + 1, sessions - 1));
  };

  const confirmAll = async () => {
    const dates = slots.map(s => s.date!.toISOString());
    const hours = slots.map(s => `${s.hora}:00`);
    const therapistIds = slots.map(s => s.therapistId);
    const metadata = {
      userId: session!.user!.id,
      serviceId: priceToServiceId[priceId],
      dates: JSON.stringify(dates),
      hours: JSON.stringify(hours),
      therapistIds: JSON.stringify(therapistIds),
    };

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, metadata }),
    });
    const { sessionId } = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    stripe?.redirectToCheckout({ sessionId });
  };

  if (status === "loading" || !session) return <Spinner className="m-5" animation="border" />;

  return (
    <Container className="py-5">
      <h2 className="dashboard-header">
        {done < sessions ? `Sesión ${current+1} de ${sessions}` : "Resumen"}
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {done < sessions ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Terapeuta</Form.Label>
            <Form.Select
              value={thisSlot.therapistId}
              onChange={e => updateSlot({ therapistId: e.target.value })}
            >
              <option value="">Selecciona un terapeuta</option>
              {therapistList.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Calendar
            onClickDay={d => (d>=now&&d<=maxDate)&&updateSlot({ date: d, hora: null })}
            value={thisSlot.date||now}
            minDate={now} maxDate={maxDate}
          />
          {thisSlot.date && (
            <div className="mt-3">
              <strong>Hora:</strong>{" "}
              {[10,11,12,13,14,15,16,17,18].map(h => (
                <Button
                  key={h}
                  variant={thisSlot.hora===h?"primary":"outline-primary"}
                  className="me-1 mb-2 slot-btn"
                  onClick={() => updateSlot({ hora: h })}
                >{h}:00</Button>
              ))}
            </div>
          )}

          <div className="mt-4 d-flex justify-content-between">
            {current>0 && <Button variant="link" onClick={()=>setCurrent(c=>c-1)}>← Anterior</Button>}
            <Button className="btn-orange" onClick={next}>
              {current < sessions-1 ? "Siguiente" : "Finalizar"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ListGroup className="mb-4">
            {slots.map((s,i)=>(
              <ListGroup.Item key={i}>
                Sesión {i+1}: {new Date(s.date!).toLocaleDateString()} a las {s.hora}:00 — {
                  therapistList.find(t => t.id===s.therapistId)?.name
                }
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button className="btn-orange" onClick={confirmAll}>
            Confirmar y pagar
          </Button>
        </>
      )}
    </Container>
  );
}