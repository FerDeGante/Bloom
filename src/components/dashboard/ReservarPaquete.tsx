// src/components/dashboard/ReservarPaquete.tsx
"use client";

import React, { useState, useEffect } from "react";
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

interface Props {
  type: string;
  sessions: number;
  priceId: string;
  title: string;   // 📌 recibimos el título
}

interface Slot {
  date: Date | null;
  hora: number | null;
  therapistId: string;
}

// mapeos para serviceId interno
const priceToServiceId: Record<string, string> = {
  price_1RJd0OFV5ZpZiouCasDGf28F: "svc_water_1",
  price_1RMBAKFV5ZpZiouCCnrjam5N: "svc_water_4",
  price_1RMBFKFV5ZpZiouCJ1vHKREU: "svc_water_8",
  price_1RMBIaFV5ZpZiouC8l6QjW2N: "svc_water_12",
};

const therapistList = [
  { id: "ther_1", name: "Jesús Ramírez" },
  { id: "ther_2", name: "Miguel Ramírez" },
  { id: "ther_3", name: "Alitzel Pacheco" },
  { id: "ther_4", name: "Francia" },
  { id: "ther_5", name: "Gisela" },
];

export default function ReservarPaquete({
  sessions,
  priceId,
  title,
}: Props) {
  const { data: session, status } = useSession();
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: sessions }, () => ({
      date: null,
      hora: null,
      therapistId: "",
    }))
  );
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/login");
  }, [status]);

  if (status === "loading" || !session)
    return <Spinner className="m-5" animation="border" />;

  // Fechas: hoy … +30 días
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const thisSlot = slots[current];
  const doneCount = slots.filter(
    (s) => s.date && s.hora !== null && s.therapistId
  ).length;

  const updateSlot = (data: Partial<Slot>) =>
    setSlots((prev) => {
      const next = [...prev];
      next[current] = { ...next[current], ...data };
      return next;
    });

  const nextStep = () => {
    if (!thisSlot.therapistId) {
      setError("Selecciona un terapeuta");
      return;
    }
    if (!thisSlot.date || thisSlot.hora === null) {
      setError("Elige fecha y hora");
      return;
    }
    setError("");
    setCurrent((c) => Math.min(c + 1, sessions - 1));
  };

  const confirmAll = async () => {
    // metadata con el título real
    const dates = slots.map((s) => s.date!.toISOString());
    const hoursArr = slots.map((s) => `${s.hora}:00`);
    const therapistIds = slots.map((s) => s.therapistId);
    const therapistNames = therapistIds.map(
      (tid) => therapistList.find((t) => t.id === tid)!.name
    );
    const serviceId = priceToServiceId[priceId];
    const serviceName = title; // 🚀 aquí usando el title real

    const metadata = {
      userId: session.user.id,
      serviceId,
      serviceName,
      dates: JSON.stringify(dates),
      hours: JSON.stringify(hoursArr),
      therapistIds: JSON.stringify(therapistIds),
      therapistNames: JSON.stringify(therapistNames),
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

  // Horarios: Lun–Vie 9–18, Sáb 9–15, Dom inhabilitado
  const isSunday = (d: Date) => d.getDay() === 0;
  const isSaturday = (d: Date) => d.getDay() === 6;
  const weekdayHours = Array.from({ length: 10 }, (_, i) => 9 + i);
  const saturdayHours = [9, 10, 11, 12, 13, 14];
  let availableHours: number[] = [];
  if (thisSlot.date) {
    const base = isSaturday(thisSlot.date) ? saturdayHours : weekdayHours;
    const isToday = thisSlot.date.toDateString() === new Date().toDateString();
    const nowHour = new Date().getHours();
    availableHours = base.filter((h) => (isToday ? h > nowHour : true));
  }

  return (
    <Container className="py-5">
      <h2 className="dashboard-header">
        {doneCount < sessions
          ? `Sesión ${current + 1} de ${sessions}`
          : "Resumen"}
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {doneCount < sessions ? (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Terapeuta</Form.Label>
            <Form.Select
              value={thisSlot.therapistId}
              onChange={(e) => updateSlot({ therapistId: e.target.value })}
            >
              <option value="">Selecciona un terapeuta</option>
              {therapistList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Calendar
            onChange={(d) =>
              updateSlot({
                date: Array.isArray(d) ? d[0] : d,
                hora: null,
              })
            }
            value={thisSlot.date || today}
            minDate={today}
            maxDate={maxDate}
            tileDisabled={({ date, view }) => view === "month" && isSunday(date)}
          />

          {thisSlot.date && (
            <div className="mt-3">
              <strong>Hora:</strong>{" "}
              {availableHours.map((h) => (
                <Button
                  key={h}
                  variant={thisSlot.hora === h ? "primary" : "outline-primary"}
                  className="me-1 mb-2"
                  onClick={() => updateSlot({ hora: h })}
                >
                  {h}:00
                </Button>
              ))}
            </div>
          )}

          <div className="mt-4 d-flex justify-content-between">
            {current > 0 && (
              <Button variant="link" onClick={() => setCurrent((c) => c - 1)}>
                ← Anterior
              </Button>
            )}
            <Button className="btn-orange" onClick={nextStep}>
              {current < sessions - 1 ? "Siguiente" : "Finalizar"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ListGroup className="mb-4">
            {slots.map((s, i) => (
              <ListGroup.Item key={i}>
                Sesión {i + 1}:{" "}
                {new Date(s.date!).toLocaleDateString()} a las{" "}
                {s.hora}:00 —{" "}
                {
                  therapistList.find((t) => t.id === s.therapistId)!
                    .name
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
