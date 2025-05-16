// src/components/dashboard/HistorySection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import { Edit3 } from "react-feather";

interface HistoryItem {
  id: string;
  date: string;       // ISO string
  serviceName: string;
  therapistName: string;
}

export default function HistorySection() {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/appointments/history")
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data: HistoryItem[]) => setRows(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        Aún no tienes sesiones agendadas.
      </Alert>
    );
  }

  return (
    <div className="overflow-auto">
      <Table hover responsive className="dashboard-table">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Terapeuta</th>
            <th>Fecha y hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const dt = new Date(r.date);
            const fecha = dt.toLocaleDateString();
            const hora = dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isFuture = dt.getTime() > Date.now();

            return (
              <tr key={r.id}>
                <td>{r.serviceName}</td>
                <td>{r.therapistName}</td>
                <td>
                  {fecha} • {hora}
                </td>
                <td>
                  <span
                    title={
                      isFuture
                        ? "Editar esta sesión"
                        : "No puedes editar sesiones pasadas"
                    }
                  >
                    <Edit3
                      size={18}
                      className={isFuture ? "icon-editable" : "icon-disabled"}
                      onClick={() => {
                        if (!isFuture) return;
                        // abrir modal de edición aquí
                      }}
                    />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}