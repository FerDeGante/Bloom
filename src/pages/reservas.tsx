// src/pages/reservas.tsx
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Container, Form, Button } from "react-bootstrap";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Tipos locales
interface Servicio {
  id: string;
  name: string;
}
interface Terapeuta {
  id: string;
  name: string;
}

export default function ReservasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Lista completa de servicios (IDs según seed/packagesData)
  const servicios: Servicio[] = [
    { id: "agua_1", name: "Estimulación temprana en agua" },
    { id: "agua_4", name: "Estimulación en agua (4×mes)" },
    { id: "agua_8", name: "Estimulación en agua (8×mes)" },
    { id: "agua_12", name: "Estimulación en agua (12×mes)" },
    { id: "piso_1", name: "Estimulación temprana en piso" },
    { id: "piso_4", name: "Estimulación en piso (4×mes)" },
    { id: "piso_8", name: "Estimulación en piso (8×mes)" },
    { id: "piso_12", name: "Estimulación en piso (12×mes)" },
    { id: "fisio_1", name: "Fisioterapia (1 sesión)" },
    { id: "fisio_5", name: "Fisioterapia (5 sesiones)" },
    { id: "fisio_10", name: "Fisioterapia (10 sesiones)" },
    { id: "post_vacuna", name: "Terapia post vacuna" },
    { id: "quiropractica", name: "Quiropráctica" },
    { id: "masajes", name: "Masajes" },
    { id: "cosmetologia", name: "Cosmetología" },
    { id: "prevencion_lesiones", name: "Prevención de lesiones" },
    { id: "preparacion_fisica", name: "Preparación física" },
    { id: "nutricion", name: "Nutrición" },
    { id: "medicina_rehab", name: "Medicina en rehabilitación" },
  ];

  // Lista completa de terapeutas (IDs slugificados)
  const terapeutas: Terapeuta[] = [
    { id: "jesus-ramirez", name: "Jesús Ramírez" },
    { id: "miguel-ramirez", name: "Miguel Ramírez" },
    { id: "alitzel-pacheco", name: "Alitzel Pacheco" },
  ];

  const [servicio, setServicio] = useState<string>("");
  const [terapeuta, setTerapeuta] = useState<string>("");
  const [fecha, setFecha] = useState<Date | null>(null);

  // Si no estás logueado, redirige
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Firma EXACTA que espera react-calendar
  const handleCalendarChange: CalendarProps["onChange"] = (value, _event) => {
    const day = Array.isArray(value) ? value[0] : value;
    setFecha(day);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ servicio, terapeuta, fecha });
    // Aquí tu lógica de API + Stripe: por ejemplo, pasar "servicio" para obtener stripePriceId y redirigir a checkout
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

        {/* Calendario */}
        <Form.Group className="mb-4">
          <Form.Label>Fecha</Form.Label>
          <Calendar
            onChange={handleCalendarChange}
            value={fecha ?? new Date()}
            minDate={new Date()}
          />
        </Form.Group>

        <Button type="submit" className="w-100 btn-orange">
          Confirmar y pagar
        </Button>
      </Form>
    </Container>
  );
}