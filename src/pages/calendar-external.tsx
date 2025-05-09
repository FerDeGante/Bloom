// src/pages/calendar-external.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function CalendarExternal() {
  const [service, setService] = useState<string>("");
  const [therapist, setTherapist] = useState<string>("");
  const [date, setDate] = useState<Date | null>(null);
  const router = useRouter();

  const servicios = [
    "agua",
    "piso",
    "quiropractica",
    "fisioterapia",
    "masajes",
    "cosmetologia",
    "prevencion-lesiones",
    "preparacion-fisica",
    "nutricion",
    "medicina-rehabilitacion",
  ];
  const terapeutas = ["Jesús Ramírez", "Miguel Ramírez", "Alitzel Pacheco", "Francia", "Gisela"];

  const onNext = () => {
    if (service && therapist && date) {
      router.push(
        `/dashboard?tab=reservar&servicio=${service}&terapeuta=${therapist}&date=${date.toISOString()}`
      );
    }
  };

  return (
    <div className="container py-5">
      <h2>Agendar sesión (externa)</h2>
      <div className="mb-3">
        <label>Servicio</label>
        <select className="form-select" onChange={(e) => setService(e.target.value)}>
          <option value="">Elige servicio</option>
          {servicios.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-3">
        <label>Terapeuta</label>
        <select className="form-select" onChange={(e) => setTherapist(e.target.value)}>
          <option value="">Elige terapeuta</option>
          {terapeutas.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      {service && therapist && (
        <div className="mb-3">
          <Calendar onChange={(d) => setDate(Array.isArray(d) ? d[0] : d)} minDate={new Date()} />
        </div>
      )}
      <button className="btn btn-primary" disabled={!date} onClick={onNext}>
        Siguiente
      </button>
    </div>
  );
}
