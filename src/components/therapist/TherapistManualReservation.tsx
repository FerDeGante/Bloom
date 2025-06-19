// src/components/therapist/TherapistManualReservation.tsx
"use client";

import React, { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";

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

export default function TherapistManualReservation() {
  // —— Listas maestras ——
  const [clients,    setClients]    = useState<Client[]>([]);
  const [packages,   setPackages]   = useState<Package[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const { data: session } = useSession();
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

  // —— Helper fetch con cookies ——
  const fetchJSON = (url: string, opts: RequestInit = {}) =>
    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  // —— 1) Carga inicial de datos ——
useEffect(() => {
    fetchJSON("/api/admin/clients")
      .then((r) => (r.ok ? r.json() : []))
      .then(setClients)
      .catch(() => setError("Error cargando clientes"));

    fetchJSON("/api/admin/packages")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPackages)
      .catch(() => setError("Error cargando paquetes"));

    fetchJSON("/api/admin/therapists")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Therapist[]) => {
        if (session?.user?.id) {
          const me = list.find((t) => t.id === session.user.id);
          setTherapists(me ? [me] : list);
        } else {
          setTherapists(list);
        }
      })
      .catch(() => setError("Error cargando terapeutas"));
  }, [session?.user?.id]);

  // —— 2) Cuando cambia paquete, regenerar X slots ——
  useEffect(() => {
    if (!packageId) {
      setSlots([]);
      return;
    }
    const pkg = packages.find((p) => p.id === packageId);
    const count = pkg?.sessions ?? 1;
    const defaultTher = therapists.length === 1 ? therapists[0].id : "";
    setSlots(
      Array.from({ length: count }, () => ({
        therapistId: defaultTher,
        date: "",
        time: "",
        availableTimes: [],
        loading: false,
      }))
    );
  }, [packageId, packages, therapists]);

  // —— 3) “Hoy” en local para filtrar horas pasadas ——
  const todayLocal = React.useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const dd   = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`; // "YYYY-MM-DD"
  }, []);

  // —— 4) Cargar disponibilidad para un slot concreto ——
  const loadTimes = async (idx: number) => {
    const s = slots[idx];
    if (!s.therapistId || !s.date) return;

    const copy = [...slots];
    copy[idx].loading = true;
    copy[idx].availableTimes = [];
    setSlots(copy);

    try {
      const res = await fetchJSON(
        `/api/admin/therapists/${s.therapistId}/availability?date=${s.date}`
      );
      if (!res.ok) throw new Error("No hay horarios");

      let times: string[] = await res.json();

      // filtrar horas pasadas si la fecha es hoyLocal
      if (s.date === todayLocal) {
        const nowH = new Date().getHours();
        times = times.filter(t => {
          const h = parseInt(t.slice(0, 2), 10);
          return h > nowH;
        });
      }

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

  // —— 5) Handlers de cambio ——
  const onTherapistChange = (i: number, id: string) => {
    const c = [...slots];
    c[i] = { therapistId: id, date: "", time: "", availableTimes: [], loading: false };
    setSlots(c);
  };

  const onDateChange = (i: number, date: string) => {
    const c = [...slots];
    c[i].date = date;
    c[i].time = "";
    c[i].availableTimes = [];
    setSlots(c);
    loadTimes(i);
  };

  const onTimeChange = (i: number, time: string) => {
    const c = [...slots];
    c[i].time = time;
    setSlots(c);
  };

  // —— 6) Validar y abrir wizard de pago ——
  const handleProceedToPay = () => {
    setError(null);
    setSuccess(null);
    if (!clientId || !packageId || slots.some(s => !s.therapistId || !s.date || !s.time)) {
      setError("Completa todos los campos de cada sesión antes de pagar.");
      return;
    }
    setShowPayment(true);
  };

  // —— 7) Confirmar pago: crear reservas + pago ——
  const handleConfirmPayment = async () => {
    setError(null);

    try {
      // 7.1 POST único con todas las sesiones
      const createRes = await fetchJSON("/api/admin/reservations", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          packageId,
          sessions: slots.map(s => ({
            therapistId: s.therapistId,
            date: new Date(`${s.date}T${s.time}:00`).toISOString(),
          })),
        }),
      });

      if (createRes.status === 400) {
        const { message } = await createRes.json();
        throw new Error(message);
      }
      if (!createRes.ok) {
        throw new Error("Error creando la reservación");
      }

      const { id: reservationId } = await createRes.json();

      // 7.2 POST al endpoint de pago con reservationId
      const payRes = await fetchJSON(
        `/api/admin/reservations/${reservationId}/payment`,
        {
          method: "POST",
          body: JSON.stringify({ method: paymentMethod }),
        }
      );
      if (!payRes.ok) {
        throw new Error("Error registrando el pago");
      }

      // 7.3 Reset + éxito
      setShowPayment(false);
      setSuccess("Reservación creada y pago registrado correctamente.");
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
        {/* Selección de cliente */}
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

        {/* Selección de paquete */}
        <Form.Group className="mb-3">
          <Form.Label>Paquete</Form.Label>
          <Form.Select value={packageId} onChange={e => setPackageId(e.target.value)}>
            <option value="">-- Selecciona paquete --</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sessions} sesión{p.sessions > 1 ? "es" : ""})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Slots dinámicos */}
        {slots.map((s, i) => (
          <Accordion key={i} className="mb-2" defaultActiveKey="0">
            <Accordion.Item eventKey={String(i)}>
              <Accordion.Header>Sesión {i + 1}</Accordion.Header>
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
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
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
                        <option key={t} value={t}>
                          {t}
                        </option>
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
        ))}

        <Button
          className="mt-3"
          onClick={handleProceedToPay}
          disabled={
            !clientId ||
            !packageId ||
            slots.some(s => !s.therapistId || !s.date || !s.time)
          }
        >
          Pasar a pagar
        </Button>
      </Form>

      {/* ——— Modal de pago ——— */}
      <Modal show={showPayment} onHide={() => setShowPayment(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Resumen de reservaciones</h5>
          <ul>
            {slots.map((s, i) => (
              <li key={i}>
                Sesión {i + 1}: {s.date} a las {s.time} con{" "}
                {therapists.find(t => t.id === s.therapistId)?.name}
              </li>
            ))}
          </ul>
          <Form>
            <Form.Check
              type="radio"
              label="Efectivo"
              name="pay"
              checked={paymentMethod === "efectivo"}
              onChange={() => setPaymentMethod("efectivo")}
            />
            <Form.Check
              type="radio"
              label="Transferencia"
              name="pay"
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
