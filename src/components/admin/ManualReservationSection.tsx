// src/components/admin/ManualReservationSection.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Modal, Spinner } from "react-bootstrap";

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

interface Reservation {
  id: string;
  date: string;
  therapistId: string;
}

// Horarios posibles
const allHours = [9,10,11,12,13,14,15,16,17,18];

type Slot = {
  therapistId: string;
  date:        string;
  time:        string;
  availableHours: number[];
};

export default function ManualReservationSection() {
  const [clientId, setClientId]     = useState("");
  const [packageId, setPackageId]   = useState("");
  const [clients,    setClients]    = useState<Client[]>([]);
  const [packages,   setPackages]   = useState<Package[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const [slots, setSlots] = useState<Slot[]>([
    { therapistId: "", date: "", time: "", availableHours: [] }
  ]);

  const [message, setMessage] = useState<string|null>(null);
  const [error,   setError]   = useState<string|null>(null);
  const [loadingClients, setLoadingClients] = useState(false);

  const [showClientModal, setShowClientModal] = useState(false);
  const [newClientName,  setNewClientName]    = useState("");
  const [newClientEmail, setNewClientEmail]   = useState("");

  // 1) Al montar
  useEffect(() => {
    fetchClients();
    fetchPackages();
    fetchTherapists();
  }, []);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const res = await fetch("/api/admin/clients");
      if (res.ok) setClients(await res.json());
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchPackages = async () => {
    const res = await fetch("/api/admin/packages");
    if (res.ok) setPackages(await res.json());
  };

  const fetchTherapists = async () => {
    const res = await fetch("/api/admin/therapists");
    if (res.ok) setTherapists(await res.json());
  };

  // 2) Crear slots según sesiones
  useEffect(() => {
    if (!packageId) {
      setSlots([{ therapistId: "", date: "", time: "", availableHours: [] }]);
      return;
    }
    const pkg = packages.find(p => p.id === packageId);
    const count = pkg?.sessions || 1;
    setSlots(Array.from({ length: count }, () => ({
      therapistId: "", date: "", time: "", availableHours: []
    })));
  }, [packageId, packages]);

  // 3) Obtener horarios libres + filtrar horas pasadas si es hoy
  const fetchFreeHours = async (therapistId: string, date: string) => {
    if (!therapistId || !date) return [];
    const res = await fetch(`/api/admin/reservations?date=${date}`);
    if (!res.ok) return [];
    const data: Reservation[] = await res.json();
    const busy = new Set<number>();
    data.forEach(r => {
      if (r.therapistId === therapistId) {
        busy.add(new Date(r.date).getHours());
      }
    });
    let available = allHours.filter(h => !busy.has(h));

    // filtrar horas pasadas si la fecha es hoy
    const todayStr = new Date().toISOString().split("T")[0];
    if (date === todayStr) {
      const nowHour = new Date().getHours();
      available = available.filter(h => h > nowHour);
    }

    return available;
  };

  // 4) Handlers por slot
  const handleTherapistChange = (idx: number, therapistId: string) => {
    setSlots(prev => {
      const copy = [...prev];
      copy[idx] = { therapistId, date: "", time: "", availableHours: [] };
      return copy;
    });
  };

  const handleDateChange = async (idx: number, date: string) => {
    const tId = slots[idx].therapistId;
    setSlots(prev => {
      const copy = [...prev];
      copy[idx] = { therapistId: tId, date, time: "", availableHours: [] };
      return copy;
    });
    if (tId && date) {
      const hours = await fetchFreeHours(tId, date);
      setSlots(prev => {
        const copy = [...prev];
        copy[idx].availableHours = hours;
        return copy;
      });
    }
  };

  const handleTimeChange = (idx: number, time: string) => {
    setSlots(prev => {
      const copy = [...prev];
      copy[idx].time = time;
      return copy;
    });
  };

  // 5) Guardar
  const save = async () => {
    setMessage(null);
    setError(null);
    if (!clientId || !packageId || slots.some(s => !s.therapistId || !s.date || !s.time)) {
      setError("Completa todos los campos en cada sesión.");
      return;
    }
    try {
      for (const slot of slots) {
        const res = await fetch("/api/admin/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId:        clientId,
            userPackageId: packageId,
            therapistId:   slot.therapistId,
            date:          new Date(`${slot.date}T${slot.time}:00`).toISOString(),
            paymentMethod: "en sucursal",
          }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error creando reserva");
        }
      }
      setMessage("Reservaciones creadas correctamente.");
      setClientId("");
      setPackageId("");
      setSlots(prev => prev.map(() => ({
        therapistId: "", date: "", time: "", availableHours: []
      })));
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 6) Nuevo cliente
  const handleCreateClient = async () => {
    if (!newClientName || !newClientEmail) return;
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClientName, email: newClientEmail }),
    });
    if (res.ok) {
      setShowClientModal(false);
      setNewClientName("");
      setNewClientEmail("");
      await fetchClients();
      setMessage("Cliente creado.");
    }
  };

  return (
    <div>
      <h3 className="mb-3">Generar reservación manual</h3>
      {message && <Alert variant="success">{message}</Alert>}
      {error   && <Alert variant="danger">{error}</Alert>}

      <Form>
        {/* Cliente */}
        <Form.Group className="mb-2">
          <Form.Label>Cliente</Form.Label>
          {loadingClients
            ? <Spinner animation="border" size="sm" className="ms-2"/>
            : clients.length
              ? (
                <Form.Select value={clientId} onChange={e => setClientId(e.target.value)}>
                  <option value="">-- Selecciona cliente --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </Form.Select>
              )
              : (
                <>
                  <Alert variant="warning">No hay clientes.</Alert>
                  <Button size="sm" variant="outline-primary" onClick={() => setShowClientModal(true)}>
                    + Crear cliente
                  </Button>
                </>
              )
          }
        </Form.Group>

        {/* Paquete */}
        <Form.Group className="mb-2">
          <Form.Label>Paquete</Form.Label>
          {packages.length
            ? (
              <Form.Select value={packageId} onChange={e => setPackageId(e.target.value)}>
                <option value="">-- Selecciona paquete --</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sessions} sesión{p.sessions>1?"es":""})
                  </option>
                ))}
              </Form.Select>
            )
            : <Alert variant="warning">No hay paquetes.</Alert>
          }
        </Form.Group>

        {/* Slots */}
        {slots.map((slot, idx) => (
          <div key={idx} className="mb-3 p-3 border rounded">
            <h5>Sesión {idx+1}</h5>

            {/* Terapeuta */}
            <Form.Group className="mb-2">
              <Form.Label>Terapeuta</Form.Label>
              <Form.Select
                value={slot.therapistId}
                onChange={e => handleTherapistChange(idx, e.target.value)}
              >
                <option value="">-- Selecciona terapeuta --</option>
                {therapists.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Fecha */}
            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={slot.date}
                onChange={e => handleDateChange(idx, e.target.value)}
                disabled={!slot.therapistId}
              />
            </Form.Group>

            {/* Hora */}
            <Form.Group>
              <Form.Label>Hora</Form.Label>
              {slot.date && slot.therapistId
                ? slot.availableHours.length
                  ? (
                    <Form.Select
                      value={slot.time}
                      onChange={e => handleTimeChange(idx, e.target.value)}
                    >
                      <option value="">-- Horario disponible --</option>
                      {slot.availableHours.map(h => {
                        const hh = String(h).padStart(2,"0");
                        return <option key={h} value={`${hh}:00`}>{hh}:00</option>;
                      })}
                    </Form.Select>
                  )
                  : <Alert variant="info">No hay horarios libres</Alert>
                : <Alert variant="secondary" className="p-2">
                    Selecciona terapeuta y fecha primero
                  </Alert>
              }
            </Form.Group>
          </div>
        ))}

        <Button
          className="btn-orange"
          onClick={save}
          disabled={
            !clientId || !packageId ||
            slots.some(s => !s.therapistId || !s.date || !s.time)
          }
        >
          Guardar
        </Button>
      </Form>

      {/* Modal Crear Cliente */}
      <Modal show={showClientModal} onHide={() => setShowClientModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Crear cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={newClientName}
                onChange={e => setNewClientName(e.target.value)}
                placeholder="Nombre completo"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={newClientEmail}
                onChange={e => setNewClientEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClientModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateClient}>
            Crear
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}