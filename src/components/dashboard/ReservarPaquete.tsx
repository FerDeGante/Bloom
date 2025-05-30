"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
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

interface Slot {
  date: Date | null;
  hora: number | null;
  therapistId: string;
}

// props que ahora sí reconoce JSX
interface ReservarPaqueteProps {
  pkgKey: string;
  sessions: number;
  priceId: string;
}

const priceToServiceId: Record<string, string> = {
 // Agua
  price_1RJd0OFV5ZpZiouCasDGf28F: "svc_water_1",
  price_1RMBAKFV5ZpZiouCCnrjam5N: "svc_water_4",
  price_1RMBFKFV5ZpZiouCJ1vHKREU: "svc_water_8",
  price_1RMBIaFV5ZpZiouC8l6QjW2N: "svc_water_12",

  // Piso
  price_1RJd1jFV5ZpZiouC1xXvllVc: "svc_floor_1",
  price_1RP6S2FV5ZpZiouC6cVpXQsJ: "svc_floor_4",
  price_1RP6TaFV5ZpZiouCoG5G58S3: "svc_floor_12",
  price_1RP6SsFV5ZpZiouCtbg4A7OE: "svc_floor_8", 

  // Fisioterapia
  price_1RJd3WFV5ZpZiouC9PDzHjKU: "svc_fisio_1",
  price_1RP6WwFV5ZpZiouCN3m0luq3: "svc_fisio_5",
  price_1RP6W9FV5ZpZiouCBXnZwxLW: "svc_fisio_10",

  // Otros
  price_1ROMxFFV5ZpZiouCdkM2KoHF: "svc_post_vacuna",
  price_1RJd2fFV5ZpZiouCsaJNkUTO: "svc_quiropractica",
  price_1RJd4JFV5ZpZiouCPjcpX3Xn: "svc_masajes",
  price_1RQaDGFV5ZpZiouCdNjxrjVk: "svc_cosmetologia",
  price_1RJd57FV5ZpZiouCpcrKNvJV: "svc_lesiones",
  price_1RJd6EFV5ZpZiouCYwD4J3I8: "svc_prep_fisica",
  price_1RJd7qFV5ZpZiouCbj6HrFJF: "svc_nutricion",
  price_1RJd9HFV5ZpZiouClVlCujAm: "svc_medicina_rehab",

};

const therapistList = [
  { id: "ther_1", name: "Jesús Ramírez" },
  { id: "ther_2", name: "Miguel Ramírez" },
  { id: "ther_3", name: "Alitzel Pacheco" },
  { id: "ther_4", name: "Francia" },
  { id: "ther_5", name: "Gisela" },
];

export default function ReservarPaquete({
  pkgKey,
  sessions: sessionCount,
  priceId: propPriceId,
}: ReservarPaqueteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { title } = router.query; // el título sigue viniendo por query

  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: sessionCount }, () => ({
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

  if (
    status === "loading" ||
    !session ||
    !propPriceId ||
    !title ||
    isNaN(sessionCount)
  ) {
    return <Spinner className="m-5" animation="border" />;
  }

  // lógica de fechas/hours igual que antes, pero usando propPriceId
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
    if (!thisSlot.therapistId) return setError("Selecciona un terapeuta");
    if (!thisSlot.date || thisSlot.hora === null)
      return setError("Elige fecha y hora");

    setError("");
    setCurrent((c) => Math.min(c + 1, sessionCount - 1));
  };

  const confirmAll = async () => {
    const dates = slots.map((s) => s.date!.toISOString());
    const hoursArr = slots.map((s) => `${s.hora}:00`);
    const therapistIds = slots.map((s) => s.therapistId);
    const therapistNames = therapistIds.map(
      (tid) => therapistList.find((t) => t.id === tid)!.name
    );
    const serviceId = priceToServiceId[propPriceId];
    const serviceName = title as string;

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
      body: JSON.stringify({ priceId: propPriceId, metadata }),
    });
    const { sessionId } = await res.json();
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    stripe?.redirectToCheckout({ sessionId });
  };

  // cálculo de availableHours igual que antes…
  const isSunday = (d: Date) => d.getDay() === 0;
  const isSaturday = (d: Date) => d.getDay() === 6;
  const weekdayHours = Array.from({ length: 10 }, (_, i) => 9 + i);
  const saturdayHours = [9, 10, 11, 12, 13, 14];
  let availableHours: number[] = [];
  if (thisSlot.date) {
    const base = isSaturday(thisSlot.date) ? saturdayHours : weekdayHours;
    const isToday = thisSlot.date.toDateString() === today.toDateString();
    const nowHour = new Date().getHours();
    availableHours = base.filter((h) => (isToday ? h > nowHour : true));
  }

  return (
    <Container className="py-5">
      <h2 className="dashboard-header">
        {doneCount < sessionCount
          ? `Sesión ${current + 1} de ${sessionCount}`
          : "Resumen"}
      </h2>
      {error && <Alert variant="danger">{error}</Alert>}

      {doneCount < sessionCount ? (
        <>
          {/* … selector de terapeuta, calendario, horas … */}
          <div className="mt-4 d-flex justify-content-between">
            {current > 0 && (
              <Button variant="link" onClick={() => setCurrent((c) => c - 1)}>
                ← Anterior
              </Button>
            )}
            <Button className="btn-orange" onClick={nextStep}>
              {current < sessionCount - 1 ? "Siguiente" : "Finalizar"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <ListGroup className="mb-4">
            {slots.map((s, i) => (
              <ListGroup.Item key={i}>
                Sesión {i + 1}:{" "}
                {new Date(s.date!).toLocaleDateString()} a las {s.hora}:00 —{" "}
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