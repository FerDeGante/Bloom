// src/components/BookingForm.jsx
"use client";
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function BookingForm({ serviceId }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!date) return;
    fetch(`/api/easy?service_id=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then(setSlots);
  }, [date, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slot_id = e.target.slot.value;
    const stripe = await stripePromise;
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
    const { sessionId } = await res.json();
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) alert(error.message);
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <label>Fecha</label>
      <input
        type="date"
        className="form-control mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {slots.length > 0 && (
        <select name="slot" className="form-select mb-3" required>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.start_time} – {s.end_time}
            </option>
          ))}
        </select>
      )}

      <h5>Datos personales</h5>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Nombre"
        value={customer.name}
        onChange={(e) =>
          setCustomer({ ...customer, name: e.target.value })
        }
        required
      />
      <input
        type="email"
        className="form-control mb-2"
        placeholder="Email"
        value={customer.email}
        onChange={(e) =>
          setCustomer({ ...customer, email: e.target.value })
        }
        required
      />
      <input
        type="tel"
        className="form-control mb-2"
        placeholder="Teléfono"
        value={customer.phone}
        onChange={(e) =>
          setCustomer({ ...customer, phone: e.target.value })
        }
        required
      />

      <button type="submit" className="btn btn-warning mt-3">
        Pagar y Agendar
      </button>
    </form>
  );
}
