// src/components/ReservasForm.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";

// Todos los servicios con su priceId
const servicios = [
  { slug: "agua", label: "Estimulación en agua", priceId: "price_1RJd0OFV5ZpZiouCasDGf28F" },
  { slug: "piso", label: "Estimulación en piso", priceId: "price_1RJd1jFV5ZpZiouC1xXvllVc" },
  { slug: "quiropractica", label: "Quiropráctica", priceId: "price_1RJd2fFV5ZpZiouCsaJNkUTO" },
  { slug: "fisioterapia", label: "Fisioterapia", priceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU" },
  { slug: "masajes", label: "Masajes", priceId: "price_1RJd4JFV5ZpZiouCPjcpX3Xn" },
  { slug: "cosmetologia", label: "Cosmetología", priceId: "price_1RJd57FV5ZpZiouCpcrKNvJV" },
  { slug: "prevencion-lesiones", label: "Prevención de lesiones", priceId: "price_1RJd57FV5ZpZiouCpcrKNvJV" },
  { slug: "preparacion-fisica", label: "Preparación física", priceId: "price_1RJd6EFV5ZpZiouCYwD4J3I8" },
  { slug: "nutricion", label: "Nutrición", priceId: "price_1RJd7qFV5ZpZiouCbj6HrFJF" },
  { slug: "medicina-rehabilitacion", label: "Medicina en rehabilitación", priceId: "price_1RJd9HFV5ZpZiouClVlCujAm" },
];

// Terapeutas disponibles
const terapeutas = [
  "Jesús Ramírez",
  "Miguel Ramírez",
  "Alitzel Pacheco",
  "Francia",
  "Gisela",
];

export default function ReservasForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [servicio, setServicio] = useState<string>("");
  const [terapeuta, setTerapeuta] = useState<string>("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [horario, setHorario] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!servicio || !terapeuta || !fecha || horario === null) {
      setError("Completa todos los campos");
      return;
    }

    const svc = servicios.find((s) => s.slug === servicio);
    if (!svc) {
      setError("Servicio inválido");
      return;
    }

    // Preparamos el body para Stripe
    const stripeBody = {
      userId: session?.user?.id,
      lineItems: [{ price: svc.priceId, quantity: 1 }],
      metadata: {
        servicio,
        terapeuta,
        date: fecha.toISOString(),
        hour: `${horario}:00`,
      },
    };

    // Llamada a nuestra API de checkout
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stripeBody),
    });

    const { sessionId } = await response.json();

    // Redirigir al checkout de Stripe
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    await stripe?.redirectToCheckout({ sessionId });
  };

  // Horarios: lunes–viernes 10–18 (9 slots), sábados 9–14 (6 slots)
  const horasSemana = Array.from({ length: 9 }, (_, i) => 10 + i);
  const horasSabado = Array.from({ length: 6 }, (_, i) => 9 + i);

  if (status === "loading" || !session) {
    return <Container className="py-5 text-center">Cargando…</Container>;
  }

  return (
    <Container className="py-5 dashboard-container">
      <h2 className="dashboard-header">Reservar cita</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Servicio */}
        <Form.Group className="mb-3">
          <Form.Label>Servicio</Form.Label>
          <Form.Select
            value={servicio}
            onChange={(e) => {
              setServicio(e.target.value);
              setFecha(null);
              setHorario(null);
            }}
            required
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Terapeuta */}
        <Form.Group className="mb-3">
          <Form.Label>Terapeuta</Form.Label>
          <Form.Select
            value={terapeuta}
            onChange={(e) => {
              setTerapeuta(e.target.value);
              setFecha(null);
              setHorario(null);
            }}
            required
          >
            <option value="">Selecciona un terapeuta</option>
            {terapeutas.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Fecha */}
        <Form.Group className="mb-4">
          <Form.Label>Fecha</Form.Label>
          <Calendar
            onChange={(d) => setFecha(Array.isArray(d) ? d[0] : d)}
            value={fecha ?? new Date()}
            minDate={new Date()}
            tileDisabled={({ date }) => date.getDay() === 0} // deshabilita domingos
            className="mb-3"
          />
        </Form.Group>

        {/* Hora (muestra solo tras elegir fecha) */}
        {fecha && (
          <Form.Group className="mb-4">
            <Form.Label>Hora</Form.Label>
            <Row>
              {(fecha.getDay() === 6 ? horasSabado : horasSemana).map((h) => (
                <Col xs={4} md={3} key={h}>
                  <Button
                    variant="outline-primary"
                    className={`w-100 slot-btn ${horario === h ? "selected" : ""}`}
                    onClick={() => setHorario(h)}
                    type="button"
                  >
                    {h}:00
                  </Button>
                </Col>
              ))}
            </Row>
          </Form.Group>
        )}

        <Button type="submit" className="w-100 btn-orange">
          Confirmar y pagar
        </Button>
      </Form>
    </Container>
  );
}
