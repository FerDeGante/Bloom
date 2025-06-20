"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

interface Client   { id: string; name: string; email: string; }
interface Package  { id: string; name: string; sessions: number; }

type Slot = {
  date:           string; // "YYYY-MM-DD"
  time:           string; // "HH:MM"
  availableTimes: string[];
  loading:        boolean;
};

type PaymentMethod = "efectivo" | "transferencia";

export default function ManualReservationSection() {
  const [clients,  setClients]  = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);

  const [clientId,  setClientId]  = useState("");
  const [packageId, setPackageId] = useState("");
  const [slots,     setSlots]     = useState<Slot[]>([]);

  const [error,   setError]   = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  const [showPayment,   setShowPayment]   = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  const availCache = useRef<Record<string,string[]>>({});

  const fetchJSON = (url: string, opts: RequestInit = {}) =>
    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  // Carga inicial
  useEffect(() => {
    fetchJSON("/api/admin/clients").then(r=>r.json()).then(setClients).catch(()=>setError("Error cargando clientes"));
    fetchJSON("/api/admin/packages").then(r=>r.json()).then(setPackages).catch(()=>setError("Error cargando paquetes"));
  }, []);

  // Regenera slots al cambiar paquete
  useEffect(() => {
    if (!packageId) return setSlots([]);
    const pkg = packages.find(p=>p.id===packageId);
    const count = pkg?.sessions || 1;
    setSlots(Array.from({length: count}).map(()=>({
      date:           "",
      time:           "",
      availableTimes: [],
      loading:        false,
    })));
  }, [packageId, packages]);

  const today = useMemo(()=>{
    const d=new Date();
    return d.toISOString().slice(0,10);
  },[]);

  // Carga horarios
  const loadTimes = async (idx:number) => {
    const s=slots[idx];
    if(!s.date) return;
    const key=s.date;
    if(availCache.current[key]){
      const c=[...slots];
      c[idx].availableTimes=availCache.current[key];
      c[idx].time=c[idx].availableTimes[0]||"";
      setSlots(c);
      return;
    }
    const c=[...slots];
    c[idx].loading=true; setSlots(c);

    try{
      const res=await fetchJSON(`/api/admin/therapists/any/availability?date=${s.date}`);
      if(!res.ok) throw new Error("No hay horarios");
      let times: string[] = await res.json();
      if(s.date===today){
        const h=new Date().getHours();
        times=times.filter(t=>parseInt(t,10)>h);
      }
      availCache.current[key]=times;
      c[idx].loading=false;
      c[idx].availableTimes=times;
      c[idx].time=times[0]||"";
      setSlots(c);
    }catch(e:any){
      c[idx].loading=false;
      setSlots(c);
      setError(e.message);
    }
  };

  // Handlers
  const onDateChange=(i:number,d:string)=>{
    const c=[...slots];
    c[i].date=d; c[i].time=""; setSlots(c);
    loadTimes(i);
  };
  const onTimeChange=(i:number,t:string)=>{
    const c=[...slots];
    c[i].time=t; setSlots(c);
  };

  const handleProceed=()=>{
    setError(null); setSuccess(null);
    if(!clientId||!packageId||slots.some(s=>!s.date||!s.time)){
      setError("Completa todos los campos."); return;
    }
    setShowPayment(true);
  };

  const handleConfirm=async()=>{
    setError(null);
    try{
      await Promise.all(slots.map(s=>
        fetchJSON("/api/admin/reservations",{
          method:"POST",
          body:JSON.stringify({
            userId:clientId,
            userPackageId:packageId,
            date:new Date(`${s.date}T${s.time}:00`).toISOString(),
            paymentMethod,
          }),
        }).then(r=>{ if(!r.ok) throw new Error("Error creando reserva"); })
      ));
      setShowPayment(false);
      setSuccess("Reservación creada.");
      setClientId(""); setPackageId(""); setSlots([]);
    }catch(e:any){
      setError(e.message);
    }
  };

  return (
    <>
      <h2>Generar reservación manual</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select value={clientId} onChange={e=>setClientId(e.target.value)}>
            <option value="">-- Selecciona cliente --</option>
            {clients.map(c=>(
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Paquete</Form.Label>
          <Form.Select value={packageId} onChange={e=>setPackageId(e.target.value)}>
            <option value="">-- Selecciona paquete --</option>
            {packages.map(p=>(
              <option key={p.id} value={p.id}>
                {p.name} ({p.sessions} sesión{p.sessions>1?"es":""})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {slots.map((s,i)=>(
          <Accordion key={i} defaultActiveKey="0" className="mb-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Sesión {i+1}</Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-2">
                      <Form.Label>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        value={s.date}
                        onChange={e=>onDateChange(i,e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Hora</Form.Label>
                      {s.loading
                        ? <Spinner animation="border" size="sm" />
                        : s.availableTimes.length>0
                          ? (
                            <Form.Select
                              value={s.time}
                              onChange={e=>onTimeChange(i,e.target.value)}
                            >
                              {s.availableTimes.map(t=>(
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </Form.Select>
                          )
                          : <div className="text-muted">— Elige fecha arriba —</div>
                      }
                      <div>
                        <Button
                          variant="link"
                          size="sm"
                          disabled={!s.date}
                          onClick={()=>loadTimes(i)}
                        >
                          Refrescar horarios
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        ))}

        <Button
          onClick={handleProceed}
          disabled={!clientId||!packageId||slots.some(s=>!s.date||!s.time)}
        >
          Continuar
        </Button>
      </Form>

      <Modal show={showPayment} onHide={()=>setShowPayment(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {slots.map((s,i)=>(
              <li key={i}>
                Sesión {i+1}: {s.date} a las {s.time}
              </li>
            ))}
          </ul>
          <Form>
            <Form.Check
              type="radio" label="Efectivo" name="pay"
              checked={paymentMethod==="efectivo"}
              onChange={()=>setPaymentMethod("efectivo")}
            />
            <Form.Check
              type="radio" label="Transferencia" name="pay"
              checked={paymentMethod==="transferencia"}
              onChange={()=>setPaymentMethod("transferencia")}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowPayment(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar reserva</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
