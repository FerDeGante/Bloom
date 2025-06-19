// src/components/admin/ManualReservationSection.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { paquetes } from "@/lib/packages";
import {
  Form,
  Button,
  Alert,
  Modal,
  Spinner,
  Accordion,
  Row,
  Col,
} from "react-bootstrap";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Package {
  id: string;
  name: string;
  sessions: number;
}

interface Therapist {
  id: string;
  name: string;
}

type Slot = {
  therapistId:    string;
  date:           string;   // "YYYY-MM-DD"
  time:           string;   // "HH:MM"
  availableTimes: string[];
  loading:        boolean;
};

type PaymentMethod = "efectivo" | "transferencia";

const priceToServiceId: Record<string, string> = {
  // Agua
  "price_1RJd0OFV5ZpZiouCasDGf28F": "svc_water_1",
  "price_1RMBAKFV5ZpZiouCCnrjam5N": "svc_water_4",
  "price_1RMBFKFV5ZpZiouCJ1vHKREU": "svc_water_8",
  "price_1RMBIaFV5ZpZiouC8l6QjW2N": "svc_water_12",

  // Piso
  "price_1RJd1jFV5ZpZiouC1xXvllVc": "svc_floor_1",
  "price_1RP6S2FV5ZpZiouC6cVpXQsJ": "svc_floor_4",
  "price_1RP6TaFV5ZpZiouCoG5G58S3": "svc_floor_12",
  "price_1RP6SsFV5ZpZiouCtbg4A7OE": "svc_floor_8",

  // Fisioterapia
  "price_1RJd3WFV5ZpZiouC9PDzHjKU": "svc_fisio_1",
  "price_1RP6WwFV5ZpZiouCN3m0luq3": "svc_fisio_5",
  "price_1RP6W9FV5ZpZiouCBXnZwxLW": "svc_fisio_10",

  // Otros
  "price_1ROMxFFV5ZpZiouCdkM2KoHF": "svc_post_vacuna",
  "price_1RJd2fFV5ZpZiouCsaJNkUTO": "svc_quiropractica",
  "price_1RJd4JFV5ZpZiouCPjcpX3Xn": "svc_masajes",
  "price_1RQaDGFV5ZpZiouCdNjxrjVk": "svc_cosmetologia",
  "price_1RJd57FV5ZpZiouCpcrKNvJV": "svc_lesiones",
  "price_1RJd6EFV5ZpZiouCYwD4J3I8": "svc_prep_fisica",
  "price_1RJd7qFV5ZpZiouCbj6HrFJF": "svc_nutricion",
  "price_1RJd9HFV5ZpZiouClVlCujAm": "svc_medicina_rehab",
};

const pkgToServiceId = paquetes.reduce<Record<string, string>>((acc, p) => {
  const sid = priceToServiceId[p.priceId];
  if (sid) acc[p.id] = sid;
  return acc;
}, {});

export default function ManualReservationSection() {
  // —— Listas maestras ——
  const [clients,    setClients]    = useState<Client[]>([]);
  const [packages,   setPackages]   = useState<Package[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // —— Selección principal ——
  const [clientId,  setClientId]  = useState<string>("");
  const [packageId, setPackageId] = useState<string>("");

  // —— Slots dinámicos según sesiones del paquete ——
  const [slots, setSlots] = useState<Slot[]>([]);

  // —— Mensajes UI ——
  const [error,   setError]   = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // —— Wizard de pago ——
  const [showPayment,   setShowPayment]   = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  // —— Cache en memoria: terapeuta+fecha → horas disponibles ——
  const availCache = useRef<Record<string,string[]>>({});

  // —— Helper fetch con cookies ——
  const fetchJSON = (url: string, opts: RequestInit = {}) =>
    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(url.includes("/availability") ? { cache: "no-store" } : {}),
      ...opts,
    });

  /** 1) Carga inicial de datos **/
  useEffect(() => {
    fetchJSON("/api/admin/clients")
      .then(r => r.ok ? r.json() : [])
      .then(setClients)
      .catch(() => setError("Error cargando clientes"));

    fetchJSON("/api/admin/packages")
      .then(r => r.ok ? r.json() : [])
      .then(setPackages)
      .catch(() => setError("Error cargando paquetes"));

    fetchJSON("/api/admin/therapists")
      .then(r => r.ok ? r.json() : [])
      .then(setTherapists)
      .catch(() => setError("Error cargando terapeutas"));
  }, []);

  /** 2) Cuando cambia paquete, regenerar X slots **/
  useEffect(() => {
    if (!packageId) {
      setSlots([]);
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    const count = pkg?.sessions ?? 1;
    setSlots(
      Array.from({ length: count }).map(() => ({
        therapistId:    "",
        date:           "",
        time:           "",
        availableTimes: [],
        loading:        false,
      }))
    );
  }, [packageId, packages]);

  /** 3) “Hoy” en local para filtrar horas pasadas **/
  const todayLocal = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0,10); // "YYYY-MM-DD"
  }, []);

  /** 4) Cargar disponibilidad para un slot concreto **/
  const loadTimes = async (idx: number) => {
    const s = slots[idx];
    if (!s.therapistId || !s.date) return;

    const key = `${s.therapistId}::${s.date}`;
    // 4a) Si ya lo teníamos en cache, úsalo al instante
    if (availCache.current[key]) {
      const copy = [...slots];
      copy[idx].availableTimes = availCache.current[key];
      copy[idx].time = availCache.current[key][0] ?? "";
      setSlots(copy);
      return;
    }

    // 4b) Cargar desde API
    const copy = [...slots];
    copy[idx].loading = true;
    setSlots(copy);

    try {
      const res = await fetchJSON(
        `/api/admin/therapists/${s.therapistId}/availability?date=${s.date}`
      );
      if (!res.ok) throw new Error("No hay horarios");
      let times: string[] = await res.json();

      // filtrar horas pasadas si es hoy
      if (s.date === todayLocal) {
        const nowH = new Date().getHours();
        times = times.filter(t => parseInt(t.slice(0, 2), 10) > nowH);
      }

      // guardar y actualizar UI
      availCache.current[key] = times;
      copy[idx].loading = false;
      copy[idx].availableTimes = times;
      copy[idx].time = times[0] ?? "";
      setSlots(copy);

    } catch (e: any) {
      copy[idx].loading = false;
      setSlots(copy);
      setError(e.message);
    }
  };

  /** 5) Handlers de cambio **/
  const onTherapistChange = (i: number, id: string) => {
    const c = [...slots];
    c[i] = { therapistId: id, date:"", time:"", availableTimes:[], loading:false };
    setSlots(c);
  };

  const onDateChange = (i: number, date: string) => {
    const c = [...slots];
    c[i].date = date;
    c[i].time = "";
    setSlots(c);
    loadTimes(i);
  };

  const onTimeChange = (i: number, time: string) => {
    const c = [...slots];
    c[i].time = time;
    setSlots(c);
  };

  /** 6) Validar y abrir wizard de pago **/
  const handleProceedToPay = () => {
    setError(null);
    setSuccess(null);
    if (!clientId || !packageId || slots.some(s => !s.therapistId || !s.date || !s.time)) {
      setError("Completa todos los campos antes de pagar.");
      return;
    }
    setShowPayment(true);
  };

  /** 7) Confirmar pago: crear reservas en paralelo **/
  const handleConfirmPayment = async () => {
    setError(null);
    try {
      const serviceId = pkgToServiceId[packageId] || packageId;
      await Promise.all(slots.map(s =>
        fetchJSON("/api/admin/reservations", {
          method: "POST",
          body: JSON.stringify({
            userId:        clientId,
            userPackageId: packageId,
            serviceId,
            therapistId:   s.therapistId,
            date:          new Date(`${s.date}T${s.time}:00`).toISOString(),
            paymentMethod,
          }),
        }).then(r => {
          if (!r.ok) throw new Error("Error creando una reserva");
        })
      ));

      setShowPayment(false);
      setSuccess("Reservaciones creadas correctamente.");
      setClientId("");
      setPackageId("");
      setSlots([]);

    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <h2>Generar reservación manual</h2>
      {error   && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form>
        {/* Cliente */}
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">-- Selecciona cliente --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Paquete */}
        <Form.Group className="mb-3">
          <Form.Label>Paquete</Form.Label>
          <Form.Select value={packageId} onChange={e => setPackageId(e.target.value)}>
            <option value="">-- Selecciona paquete --</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sessions} sesión{p.sessions>1?"es":""})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Slots dinámicos */}
        {slots.map((s, i) =>
          <Accordion key={i} className="mb-2" defaultActiveKey="0">
            <Accordion.Item eventKey={String(i)}>
              <Accordion.Header>Sesión {i+1}</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Terapeuta</Form.Label>
                      <Form.Select
                        value={s.therapistId}
                        onChange={e => onTherapistChange(i, e.target.value)}
                      >
                        <option value="">-- Selecciona terapeuta --</option>
                        {therapists.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        value={s.date}
                        disabled={!s.therapistId}
                        onChange={e => onDateChange(i, e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label>Hora</Form.Label>
                  {s.loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : s.availableTimes.length > 0 ? (
                    <Form.Select
                      value={s.time}
                      onChange={e => onTimeChange(i, e.target.value)}
                    >
                      <option value="">-- Selecciona hora --</option>
                      {s.availableTimes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Form.Select>
                  ) : (
                    <Alert variant="info" className="py-1">
                      {s.date && s.therapistId
                        ? "No hay horarios libres"
                        : "Selecciona terapeuta y fecha primero"}
                    </Alert>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    disabled={!s.therapistId || !s.date}
                    onClick={() => loadTimes(i)}
                  >
                    Refrescar horarios
                  </Button>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        )}

        <Button
          className="mt-3"
          onClick={handleProceedToPay}
          disabled={!clientId || !packageId || slots.some(s => !s.therapistId || !s.date || !s.time)}
        >
          Pasar a pagar
        </Button>
      </Form>

      {/* Modal de pago */}
      <Modal show={showPayment} onHide={() => setShowPayment(false)}>
        <Modal.Header closeButton><Modal.Title>Confirmar pago</Modal.Title></Modal.Header>
        <Modal.Body>
          <h5>Resumen de reservaciones</h5>
          <ul>
            {slots.map((s, i) => (
              <li key={i}>
                Sesión {i+1}: {s.date} a las {s.time} con{" "}
                {therapists.find(t => t.id === s.therapistId)?.name}
              </li>
            ))}
          </ul>
          <Form>
            <Form.Check
              type="radio" label="Efectivo" name="pay"
              checked={paymentMethod === "efectivo"}
              onChange={() => setPaymentMethod("efectivo")}
            />
            <Form.Check
              type="radio" label="Transferencia" name="pay"
              checked={paymentMethod === "transferencia"}
              onChange={() => setPaymentMethod("transferencia")}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayment(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmPayment}>Confirmar pago</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}