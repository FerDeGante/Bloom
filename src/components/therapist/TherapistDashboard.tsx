"use client";

import React, { useEffect, useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";

interface ReservationItem {
  id: string;
  date: string;
  service: { name: string };
  user: { name: string };
}

export default function TherapistDashboard() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/therapist/${session.user.id}/reservations`)
      .then((r) => r.json())
      .then(setRows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.user?.id]);

  const calLink = (r: ReservationItem) => {
    const start = new Date(r.date);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
    return (
      "https://www.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(r.service.name)}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(r.service.name)}`
    );
  };

  if (loading) return <Spinner className="m-5" animation="border" />;

  return (
    <Table hover responsive className="dashboard-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Cliente</th>
          <th>Servicio</th>
          <th>Calendario</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const dt = new Date(r.date);
          const disp = `${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`;
          return (
            <tr key={r.id}>
              <td>{disp}</td>
              <td>{r.user.name}</td>
              <td>{r.service.name}</td>
              <td>
                <a href={calLink(r)} target="_blank" rel="noopener noreferrer">
                  Añadir
                </a>
              </td>
            </tr>
          );
        })}
        {rows.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center">
              — Sin reservaciones —
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}
