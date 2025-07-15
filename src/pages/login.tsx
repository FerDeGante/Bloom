import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Modal de recuperación
  const [showReset, setShowReset] = useState(false);

  return (
    <>
      <Head>
        <title>Iniciar Sesión • Bloom Fisio</title>
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      <div className="vh-100 d-flex justify-content-center align-items-center">
        <form onSubmit={async (e) => {
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
            setError(res.error === "CredentialsSignin"
              ? "Error: correo o contraseña incorrectos."
              : res.error);
          } else {
            const session = await getSession();
            let target = "/dashboard?tab=reservar";
            if (session?.user?.role === "ADMIN") target = "/admin";
            else if (session?.user?.role === "THERAPIST") target = "/therapist";
            window.location.href = target;
          }
        }} className="contact-card p-4" style={{ maxWidth: 400, width: "100%" }}>
          <h2 className="text-center">Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <input type="email" className="form-control mb-3" placeholder="Correo" required onChange={e => setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Contraseña" required onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-orange w-100" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
          <div className="text-center mt-3">
            <span className="text-link" style={{ cursor: "pointer", color: "var(--primary)" }} onClick={() => setShowReset(true)}>
              ¿Olvidaste tu contraseña?
            </span>
            <br />
            <Link href="/register">¿No tienes cuenta? Regístrate</Link>
          </div>
        </form>
        <ForgotPasswordModal show={showReset} onClose={() => setShowReset(false)} />
      </div>
    </>
  );
}

// --- Modal como sub-componente ---
function ForgotPasswordModal({ show, onClose }: { show: boolean, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  // Envío de código
  const handleSendToken = async () => {
    setResetStatus("Enviando código...");
    setResetError(null);
    const res = await fetch("/api/auth/request-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: resetEmail, checkUser: true, purpose: "reset" }),
    });
    const data = await res.json();
    if (res.ok) {
      setStep(2);
      setResetStatus("Código enviado a tu correo.");
    } else {
      setResetError(data.error || "No se pudo enviar el código.");
      setResetStatus(null);
    }
  };

  // Cambia contraseña
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus("Guardando...");
    setResetError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: resetEmail,
        token: resetToken,
        password: newPassword,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setResetStatus("¡Contraseña cambiada! Ahora puedes iniciar sesión.");
      setTimeout(onClose, 2000);
    } else {
      setResetError(data.error || "No se pudo cambiar la contraseña.");
      setResetStatus(null);
    }
  };

  if (!show) return null;
  return (
    <div className="bloom-modal-backdrop">
      <div className="bloom-modal-card" style={{ minWidth: 320 }}>
        <button className="bloom-modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <div className="text-center mb-3">
          <img src="/images/logo_bloom_clean.png" alt="Bloom Fisio"
            style={{ width: 48, height: 48, borderRadius: 12, background: "#fff", boxShadow: "0 1px 8px #0001", marginBottom: 10 }} />
          <h3 style={{ color: "var(--primary)", fontWeight: 700 }}>Recupera tu contraseña</h3>
        </div>
        {resetError && <div className="alert alert-danger">{resetError}</div>}
        {resetStatus && <div className="alert alert-success">{resetStatus}</div>}

        {step === 1 && (
          <>
            <div className="form-floating mb-3">
              <input
                id="resetEmail"
                name="resetEmail"
                type="email"
                className="form-control"
                placeholder="Correo electrónico"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
              />
              <label htmlFor="resetEmail">Correo electrónico</label>
            </div>
            <button className="btn btn-orange w-100" onClick={handleSendToken}>
              Enviar código
            </button>
          </>
        )}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <div className="form-floating mb-3">
              <input
                id="resetToken"
                name="resetToken"
                type="text"
                className="form-control"
                placeholder="Código recibido"
                value={resetToken}
                onChange={e => setResetToken(e.target.value)}
                required
              />
              <label htmlFor="resetToken">Código recibido</label>
            </div>
            <div className="form-floating mb-3">
              <PasswordInput
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                id="newPassword"
                name="newPassword"
                placeholder="Nueva contraseña"
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-orange w-100">
              Cambiar contraseña
            </button>
          </form>
        )}
        <button className="btn btn-link mt-3 w-100" style={{ color: "#888" }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
