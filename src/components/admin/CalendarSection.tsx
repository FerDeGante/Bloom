"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Spinner } from "react-bootstrap";

export interface Reservation {
  id: string;
  date: string;
  userName: string;
  serviceName: string;
  therapistName: string;
  paymentMethod: string;
  sessionNumber: number;
  totalSessions: number;
}

export default function CalendarSection() {
  const [selectedDate, setSelectedDate]       = useState<Date>(new Date());
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());
  const [reservedDates, setReservedDates]     = useState<string[]>([]);
  const [reservations, setReservations]       = useState<Reservation[]>([]);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState<string>("");

  // 1) Traer días reservados al cambiar de mes
  useEffect(() => {
    const y = activeStartDate.getFullYear();
    const m = activeStartDate.getMonth();
    const first = new Date(y, m, 1).toISOString();
    const last  = new Date(y, m + 1, 0).toISOString();

    fetch(`/api/admin/reservations?start=${first}&end=${last}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<Reservation[]>;
      })
      .then((data) => {
        const days = Array.from(new Set(data.map((r) => r.date.slice(0, 10))));
        setReservedDates(days);
      })
      .catch((e) => {
        console.error("Error cargando días reservados:", e);
        setReservedDates([]);
      });
  }, [activeStartDate]);

  // 2) Traer detalle al cambiar de día
  useEffect(() => {
    setLoading(true);
    setError("");
    setReservations([]);

    const Y  = selectedDate.getFullYear();
    const Mo = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const D  = String(selectedDate.getDate()).padStart(2, "0");
    const url = `/api/admin/reservations?date=${Y}-${Mo}-${D}`;

    fetch(url, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
        return res.json() as Promise<Reservation[]>;
      })
      .then((dayData) => {
        setReservations(dayData);
      })
      .catch((e: any) => {
        console.error("Error cargando reservaciones:", e);
        setError(e.message || "Error cargando reservaciones.");
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  return (
    <div className="d-flex">
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
            view === "month" &&
            reservedDates.includes(date.toISOString().slice(0, 10))
              ? "has-reservation"
              : undefined
          }
        />
      </div>
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
