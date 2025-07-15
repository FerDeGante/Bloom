// src/pages/login.tsx
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados recuperación contraseña
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(0);
  const [resetError, setResetError] = useState(null);
  const [resetStatus, setResetStatus] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      const msg =
        res.error === "CredentialsSignin"
          ? "Error: correo o contraseña incorrectos."
          : res.error;
      setError(msg);
    } else {
      const session = await getSession();
      let target = "/dashboard?tab=reservar";
      if (session?.user?.role === "ADMIN") target = "/admin";
      else if (session?.user?.role === "THERAPIST") target = "/therapist";

      window.location.href = target;
    }
  };

  // Maneja envío de código por correo
  const handleSendToken = async () => {
    setResetStatus("Enviando...");
    const res = await fetch("/api/auth/request-token", {
      method: "POST",
      body: JSON.stringify({ email: resetEmail }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      setStep(2);
      setResetStatus(data.message);
      setResetError(null);
    } else {
      setResetError(data.error);
      setResetStatus("");
    }
  };

  // Maneja cambio de contraseña
  const handleResetPassword = async () => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ email: resetEmail, token: resetToken, newPassword }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      setResetStatus(data.message);
      setResetError(null);
      setStep(0);
    } else {
      setResetError(data.error);
      setResetStatus("");
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión • Bloom Fisio</title>
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      <div className="vh-100 d-flex justify-content-center align-items-center">
        <form onSubmit={handleSubmit} className="contact-card p-4" style={{ maxWidth: 400, width: "100%" }}>
          <h2 className="text-center">Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}

          <input type="email" className="form-control mb-3" placeholder="Correo" required onChange={e => setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Contraseña" required onChange={e => setPassword(e.target.value)} />

          <button className="btn btn-orange w-100" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>

          <div className="text-center mt-3">
            <span className="text-link" onClick={() => setStep(1)}>¿Olvidaste tu contraseña?</span>
            <br />
            <Link href="/register">¿No tienes cuenta? Regístrate</Link>
          </div>
        </form>

        {step > 0 && (
          <div className="modal-overlay">
            <div className="modal-content">
              {step === 1 && (
                <>
                  <input type="email" placeholder="Correo registrado" className="form-control mb-3"
                    onChange={(e) => setResetEmail(e.target.value)} />
                  <button className="btn btn-orange" onClick={handleSendToken}>Enviar código</button>
                </>
              )}
              {step === 2 && (
                <>
                  <input placeholder="Código del correo" className="form-control mb-2"
                    onChange={(e) => setResetToken(e.target.value)} />
                  <input placeholder="Nueva contraseña" type="password" className="form-control mb-2"
                    onChange={(e) => setNewPassword(e.target.value)} />
                  <button className="btn btn-orange" onClick={handleResetPassword}>Cambiar contraseña</button>
                </>
              )}
              {resetError && <p className="text-danger">{resetError}</p>}
              {resetStatus && <p className="text-success">{resetStatus}</p>}
              <button className="btn btn-secondary mt-2" onClick={() => setStep(0)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
