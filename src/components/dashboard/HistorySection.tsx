"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Table, Alert } from "react-bootstrap";
import { format } from "date-fns";

interface Reservation {
  id: string;
  service: { name: string };
  therapist: { name: string };
  date: string;
}

export default function HistorySection() {
  const { status } = useSession({ required: true });
  const [history, setHistory] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setHistory(data.reservations || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando historial…</p>;
  if (history.length === 0) {
    return <Alert variant="info">No tienes reservaciones.</Alert>;
  }

  return (
    <div className="table-responsive">
      <Table striped>
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Terapeuta</th>
            <th>Fecha</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => {
            const dt = new Date(item.date);
            return (
              <tr key={item.id}>
                <td>{item.service.name}</td>
                <td>{item.therapist.name}</td>
                <td>{format(dt, "yyyy-MM-dd")}</td>
                <td>{format(dt, "HH:mm")}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}