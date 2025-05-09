import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  Container,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const servicios = [
  { id: "agua", name: "Estimulación en agua" },
  { id: "piso", name: "Estimulación en piso" },
  { id: "quiropractica", name: "Quiropráctica" },
  // … los demás servicios
];

const terapeutas = [
  { id: "t1", name: "Terapeuta A" },
  { id: "t2", name: "Terapeuta B" },
  // … luego los cargas dinámicamente desde tu API
];

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [servicio, setServicio] = useState("");
  const [terapeuta, setTerapeuta] = useState("");
  const [fecha, setFecha] = useState<Date | null>(null);

  // Redirige si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí llamas a tu API para crear la cita y rediriges al checkout de Stripe
    // Ejemplo:
    // const res = await fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ servicio, terapeuta, fecha }) });
    // const { sessionId } = await res.json();
    // router.push(`/checkout?session_id=${sessionId}`);
    console.log({ servicio, terapeuta, fecha });
  };

  if (status === "loading" || !session) {
    return <Container className="py-5">Cargando…</Container>;
  }

  return (
    <Container className="py-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4 text-center">Reservar cita</h2>
      <Form onSubmit={handleSubmit}>
        {/* Selección de servicio */}
        <Form.Group className="mb-3">
          <Form.Label>Servicio</Form.Label>
          <Form.Select
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            required
          >
            <option value="">Selecciona un servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Selección de terapeuta */}
        <Form.Group className="mb-3">
          <Form.Label>Terapeuta</Form.Label>
          <Form.Select
            value={terapeuta}
            onChange={(e) => setTerapeuta(e.target.value)}
            required
          >
            <option value="">Selecciona un terapeuta</option>
            {terapeutas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Calendario y hora */}
        <Form.Group className="mb-4">
          <Form.Label>Fecha y hora</Form.Label>
          <Calendar
            onChange={(value: Date | Date[]) => {
              // si devuelven un rango, tomamos el primer día
              if (value instanceof Date) {
                setFecha(value);
              } else {
                setFecha(value[0] ?? null);
              }
            }}
            value={fecha}
            minDate={new Date()}
          />
          {fecha && (
            <Alert variant="info" className="mt-2">
              Has seleccionado:{" "}
              {fecha.toLocaleDateString()}{" "}
              {fecha.toLocaleTimeString()}
            </Alert>
          )}
        </Form.Group>

        <Button type="submit" className="w-100">
          Confirmar y pagar
        </Button>
      </Form>
    </Container>
  );
}
