// src/components/admin/ReportsSection.tsx
"use client";

import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  Row,
  Col,
  Card
} from "react-bootstrap";

interface TotalByDay {
  date: string;        // "YYYY-MM-DD"
  count: number;       // nº de citas en ese día
  totalAmount: number; // monto total recaudado
}

interface ReservationDetail {
  id: string;
  date: string;         // ISO completo
  clientName: string;
  serviceName: string;
  therapistName: string;
  amount: number;
  paymentMethod: string;
}

interface ReportsResponse {
  totalByDay: TotalByDay[];
  details: ReservationDetail[];
}

export default function ReportsSection() {
  // Rangos de fecha (YYYY-MM-DD)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate]   = useState<string>("");

  // Resultados
  const [totalByDay, setTotalByDay] = useState<TotalByDay[]>([]);
  const [details,    setDetails]    = useState<ReservationDetail[]>([]);

  // Estado de carga / error
  const [loading, setLoading] = useState<boolean>(false);
  const [error,   setError]   = useState<string | null>(null);

  const fetchReports = async () => {
    // resetear mensajes y datos
    setError(null);
    setTotalByDay([]);
    setDetails([]);

    // validaciones básicas
    if (!fromDate || !toDate) {
      setError("Por favor selecciona ambas fechas (Desde y Hasta).");
      return;
    }
    if (fromDate > toDate) {
      setError("La fecha “Desde” no puede ser posterior a “Hasta”.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`/api/admin/reports?from=${fromDate}&to=${toDate}`);
      if (!resp.ok) {
        // siempre devolvemos JSON { error: "..." }
        const errBody = await resp.json().catch(() => ({}));
        const msg = (errBody.error as string) || `Error ${resp.status}`;
        throw new Error(msg);
      }

      const data: ReportsResponse = await resp.json();
      setTotalByDay(data.totalByDay);
      setDetails(data.details);
    } catch (e: any) {
      console.error("Error cargando reportes:", e);
      setError(e.message || "Error de red al cargar reportes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="mb-4">Reportes</h3>

      {/* ===== Formulario de rango ===== */}
      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group controlId="fromDate">
                  <Form.Label>Desde</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="toDate">
                  <Form.Label>Hasta</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button
                  className="btn-orange"
                  onClick={fetchReports}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Cargando…
                    </>
                  ) : (
                    "Cargar"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
          {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
        </Card.Body>
      </Card>

      {/* ===== Resumen diario ===== */}
      {totalByDay.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Resumen Diario</h5>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nº Reservas</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                {totalByDay.map((row) => (
                  <tr key={row.date}>
                    <td>
                      {new Date(row.date).toLocaleDateString("es-ES", {
                        day:   "2-digit",
                        month: "long",
                        year:  "numeric",
                      })}
                    </td>
                    <td>{row.count}</td>
                    <td>${row.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ===== Detalle de reservas ===== */}
      {details.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Detalle de Reservaciones</h5>
          </Card.Header>
          <Card.Body>
            <Table responsive bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Fecha / Hora</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Terapeuta</th>
                  <th>Monto</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {details.map((r) => {
                  const dt = new Date(r.date);
                  return (
                    <tr key={r.id}>
                      <td>
                        {dt.toLocaleDateString("es-ES", {
                          day:   "2-digit",
                          month: "long",
                          year:  "numeric",
                        })}{" "}
                        {dt.toLocaleTimeString("es-ES", {
                          hour:   "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td>{r.clientName}</td>
                      <td>{r.serviceName}</td>
                      <td>{r.therapistName}</td>
                      <td>${r.amount.toFixed(2)}</td>
                      <td>
                        {r.paymentMethod === "en sucursal" ? (
                          <span className="badge bg-warning text-dark">
                            En sucursal 💵
                          </span>
                        ) : (
                          <span className="badge bg-info text-dark">
                            Stripe 💳
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* ===== Estado inicial sin datos ===== */}
      {!loading && !error && totalByDay.length === 0 && details.length === 0 && (
        <Alert variant="info">
          Selecciona un rango de fechas y presiona “Cargar” para ver los resultados.
        </Alert>
      )}
    </div>
  );
}