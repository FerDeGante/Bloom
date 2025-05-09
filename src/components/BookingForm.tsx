// src/components/BookingForm.jsx
"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;
function getStripe() {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      throw new Error(
        "Falta la variable de entorno NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
      );
    }
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

export default function BookingForm({ serviceId }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // Carga los slots al cambiar la fecha
  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }
    fetch(`/api/easy?service_id=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots)
      .catch((err) => {
        console.error("Error al cargar slots:", err);
        setSlots([]);
      });
  }, [date, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slot_id = e.target.slot.value;
      const stripe = await getStripe();

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          slot_id,
          date,
          customer,
        }),
      });
      if (!res.ok) throw new Error("Error creando sesión de pago");
      const { sessionId } = await res.json();

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al redirigir al pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <label className="form-label">Fecha</label>
      <input
        type="date"
        className="form-control mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {slots.length > 0 && (
        <select name="slot" className="form-select mb-3" required>
          <option value="">Selecciona un horario</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.start_time} – {s.end_time}
            </option>
          ))}
        </select>
      )}

      <h5 className="mt-4">Datos personales</h5>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Nombre completo"
        value={customer.name}
        onChange={(e) =>
          setCustomer({ ...customer, name: e.target.value })
        }
        required
      />
      <input
        type="email"
        className="form-control mb-2"
        placeholder="Correo electrónico"
        value={customer.email}
        onChange={(e) =>
          setCustomer({ ...customer, email: e.target.value })
        }
        required
      />
      <input
        type="tel"
        className="form-control mb-3"
        placeholder="Teléfono"
        value={customer.phone}
        onChange={(e) =>
          setCustomer({ ...customer, phone: e.target.value })
        }
        required
      />

      <button
        type="submit"
        className="btn btn-warning mt-3"
        disabled={loading}
      >
        {loading ? "Procesando…" : "Pagar y Agendar"}
      </button>
    </form>
  );
}
