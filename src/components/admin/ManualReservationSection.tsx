"use client";
import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

export default function ManualReservationSection() {
  const [client, setClient] = useState("");
  const [service, setService] = useState("");
  const [therapist, setTherapist] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState<string|null>(null);
  const [error, setError] = useState<string|null>(null);

  const save = async () => {
    setError(null);
    setMessage(null);
    const res = await fetch("/api/admin/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: client,
        serviceId: service,
        therapistId: therapist,
        date: new Date(`${date}T${time}:00`).toISOString(),
        paymentMethod: "efectivo",
      }),
    });
    if (res.ok) {
      setMessage("Reservación creada correctamente.");
      setClient("");
      setService("");
      setTherapist("");
      setDate("");
      setTime("");
    } else {
      const data = await res.json();
      setError(data.error || "Error");
    }
  };

  return (
    <div>
      <h3 className="mb-3">Generar reservación</h3>
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form>
        <Form.Group className="mb-2">
          <Form.Label>Cliente</Form.Label>
          <Form.Control value={client} onChange={e => setClient(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Servicio</Form.Label>
          <Form.Control value={service} onChange={e => setService(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Terapeuta</Form.Label>
          <Form.Control value={therapist} onChange={e => setTherapist(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Fecha</Form.Label>
          <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Hora</Form.Label>
          <Form.Control type="time" value={time} onChange={e => setTime(e.target.value)} />
        </Form.Group>
        <Button className="btn-orange" type="button" onClick={save}>Guardar</Button>
      </Form>
    </div>
  );
}
