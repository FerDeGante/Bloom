// src/components/admin/CalendarSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Spinner } from "react-bootstrap";

// Cada reserva que devuelve el endpoint ya incluye número de sesión y total de sesiones
export interface Reservation {
  id: string;
  date: string;         // ISO string
  userName: string;
  serviceName: string;
  therapistName: string;
  paymentMethod: string; // "en sucursal" o "stripe"
  sessionNumber: number; // p.ej. 2
  totalSessions: number; // p.ej. 4
}

export default function CalendarSection() {
  // 1) Fecha seleccionada en el calendario
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // 2) Punto de partida del mes que muestra el calendario
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  // 3) Días marcados (YYYY-MM-DD) que tienen al menos 1 reserva
  const [reservedDates, setReservedDates] = useState<string[]>([]);
  // 4) Reservas del día seleccionado
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // — Cada vez que cambie el mes que se ve en el calendario, recargamos los días con reservas —
  useEffect(() => {
    (async () => {
      const year  = activeStartDate.getFullYear();
      const month = activeStartDate.getMonth(); // 0-based
      const first = new Date(year, month, 1).toISOString();
      const last  = new Date(year, month + 1, 0).toISOString();

      try {
        const res = await fetch(`/api/admin/reservations?start=${first}&end=${last}`);
        if (!res.ok) throw new Error(res.statusText);
        const data: Reservation[] = await res.json();
        // Extraemos días únicos
        const days = Array.from(new Set(data.map(r => r.date.slice(0, 10))));
        setReservedDates(days);
      } catch (e) {
        console.error("Error cargando días reservados:", e);
        setReservedDates([]);
      }
    })();
  }, [activeStartDate]);

  // — Cada vez que cambie el día seleccionado, recargamos sus reservas —
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      setReservations([]);

      const Y  = selectedDate.getFullYear();
      const Mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const D  = String(selectedDate.getDate()).padStart(2, "0");

      try {
        const res = await fetch(`/api/admin/reservations?date=${Y}-${Mo}-${D}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || res.statusText);
        }
        const dayData: Reservation[] = await res.json();
        setReservations(dayData);
      } catch (e: any) {
        setError(e.message || "Error cargando reservaciones.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedDate]);

  return (
    <div className="d-flex">
      {/* —— Calendario de mes con puntos en días reservados —— */}
      <div className="me-4">
        <Calendar
          value={selectedDate}
          onChange={(d) => {
            const dt = Array.isArray(d) ? d[0] : d;
            if (dt instanceof Date && !isNaN(dt.getTime())) {
              setSelectedDate(dt);
            }
          }}
          onActiveStartDateChange={({ activeStartDate }) => {
            if (activeStartDate instanceof Date) {
              setActiveStartDate(activeStartDate);
            }
          }}
          tileClassName={({ date, view }) =>
            view === "month" && reservedDates.includes(date.toISOString().slice(0,10))
              ? "has-reservation"
              : undefined
          }
        />
      </div>

      {/* —— Reservas del día seleccionado —— */}
      <div className="flex-grow-1">
        <h3 className="mb-3 text-primary">
          Reservaciones para {selectedDate.toLocaleDateString("es-ES")}
        </h3>

        {loading ? (
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Cargando reservaciones…</span>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="alert alert-info">
            No hay reservaciones registradas para este día.
          </div>
        ) : (
          <div className="mt-3">
            {reservations.map((r) => {
              const hora = new Date(r.date).toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div key={r.id} className="p-3 mb-2 border rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="fw-bold">{hora}</span>
                      <span className="ms-2">{r.userName}</span>
                      <div className="text-secondary">
                        {r.serviceName} — {r.therapistName}
                      </div>
                      <div className="mt-1">
                        <small className="text-muted">
                          Sesión {r.sessionNumber}/{r.totalSessions}
                        </small>
                      </div>
                    </div>
                    <div>
                      {r.paymentMethod === "en sucursal" ? (
                        <span className="badge bg-warning text-dark">
                          En sucursal 💵
                        </span>
                      ) : (
                        <span className="badge bg-info text-dark">
                          Stripe 💳
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}