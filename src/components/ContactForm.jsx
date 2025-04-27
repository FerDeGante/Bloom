"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ nombre: "", apellidos: "", email: "", tel: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "ok" | "error"

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/mailchimp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setStatus("ok");
      else throw new Error();
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-card mx-auto">
      {/* 4 Floating inputs uno debajo del otro */}
      {[
        { id: "nombre", label: "Nombre", type: "text" },
        { id: "apellidos", label: "Apellidos", type: "text" },
        { id: "email", label: "Correo electrónico", type: "email" },
        { id: "tel", label: "Teléfono", type: "tel" },
      ].map(({ id, label, type }) => (
        <div key={id} className="form-floating mb-3">
          <input
            type={type}
            id={id}
            name={id}
            className="form-control"
            placeholder={label}
            value={form[id]}
            onChange={handleChange}
            required={id !== "tel"}
          />
          <label htmlFor={id}>{label}</label>
        </div>
      ))}

      <button
        className="btn btn-orange w-100 py-2"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Enviando…" : "Sí quiero"}
      </button>

      {status === "ok" && (
        <p className="text-success text-center mt-3 mb-0">
          ¡Gracias por suscribirte!
        </p>
      )}
      {status === "error" && (
        <p className="text-danger text-center mt-3 mb-0">
          Ocurrió un error. Intenta de nuevo.
        </p>
      )}
    </form>
  );
}
