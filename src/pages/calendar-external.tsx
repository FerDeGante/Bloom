// pages/calendar-external.tsx
import { useState, useEffect } from "react";
import Calendar from "@/components/Calendar";
import ServiceSelector from "@/components/ServiceSelector";
import { useRouter } from "next/router";

export default function CalendarExternal() {
  const [service, setService] = useState<string|null>(null);
  const [therapist, setTherapist] = useState<string|null>(null);
  const router = useRouter();

  const onNext = (date: Date, time: string) => {
    router.push(`/dashboard/${service}?date=${date.toISOString()}&time=${time}`);
  };

  return (
    <div className="container py-5">
      <h2>Agendar sesión</h2>
      <ServiceSelector
        onServiceChange={setService}
        onTherapistChange={setTherapist}
      />
      {service && therapist && (
        <Calendar
          onSelectSlot={(date, time) => onNext(date, time)}
          therapistId={therapist}
        />
      )}
    </div>
  );
}
