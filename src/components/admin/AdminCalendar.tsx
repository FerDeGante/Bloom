"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Form, Button, Alert, ListGroup } from "react-bootstrap";

interface Reservation {
  id: string;
  date: string;
  therapistName: string;
  userName: string;
  serviceName: string;
}

export default function AdminCalendar() {
  const [date, setDate] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [therapistId, setTherapistId] = useState("");
  const [hour, setHour] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    fetch(`/api/admin/reservations?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((r) => r.json())
      .then((data: Reservation[]) => setReservations(data))
      .catch(console.error);
  }, [date]);

  const availableHours = [9,10,11,12,13,14,15,16,17,18];

  const createReservation = async () => {
    if (!userEmail || !serviceId || !therapistId || hour === null) {
      setError("Faltan campos");
      return;
    }
    const when = new Date(date);
    when.setHours(hour, 0, 0, 0);
    const res = await fetch("/api/admin/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userEmail,
        serviceId,
        therapistId,
        date: when.toISOString(),
        paymentMethod: "efectivo",
      }),
    });
    if (res.ok) {
      setSuccess("Cita registrada");
      setUserEmail("");
      setServiceId("");
      setTherapistId("");
      setHour(null);
    } else {
      const data = await res.json();
      setError(data.error || "Error");
    }
  };

  return (
    <div>
      <h3 className="mb-3">Calendario</h3>
      <Calendar value={date} onChange={(d) => setDate(Array.isArray(d) ? d[0] : d)} />
      <ListGroup className="my-3">
        {reservations.map((r) => (
          <ListGroup.Item key={r.id}>
            {new Date(r.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            {" - "}{r.userName} ({r.serviceName})
          </ListGroup.Item>
        ))}
      </ListGroup>
      <h4>Registrar cita manual</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form className="mb-3">
        <Form.Group className="mb-2">
          <Form.Label>Correo del cliente (ID)</Form.Label>
          <Form.Control value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>ID del servicio</Form.Label>
          <Form.Control value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>ID del terapeuta</Form.Label>
          <Form.Control value={therapistId} onChange={(e) => setTherapistId(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Hora</Form.Label>
          <div>
            {availableHours.map((h) => (
              <Button
                key={h}
                className="me-1 mb-1"
                variant={hour === h ? "primary" : "outline-primary"}
                onClick={() => setHour(h)}
              >
                {h}:00
              </Button>
            ))}
          </div>
        </Form.Group>
        <Button className="btn-orange" type="button" onClick={createReservation}>
          Guardar
        </Button>
      </Form>
    </div>
  );
}
