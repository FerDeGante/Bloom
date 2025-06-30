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

  const handleSubmit = async (e: React.FormEvent) => {
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
      // Espera la sesión para saber el rol exacto
      const session = await getSession();
      let target = "/dashboard?tab=reservar";
      if (session?.user?.role === "ADMIN") {
        target = "/admin";
      } else if (session?.user?.role === "THERAPIST") {
        target = "/therapist";
      }
      window.location.href = target;
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión • Bloom Fisio</title>
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="position-absolute top-0 start-0 p-3">
          <Link href="/" legacyBehavior>
            <a>
              <Image src="/images/logo_bloom_clean.png" width={80} height={80} alt="Logo" />
            </a>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="contact-card p-4" style={{ maxWidth: 400, width: "100%" }}>
          <h2 className="mb-3 text-center">Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-floating mb-3">
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Correo"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Correo</label>
          </div>
          <div className="form-floating mb-4">
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>
          </div>
          <button type="submit" className="btn btn-orange w-100 py-2" disabled={loading}>
            {loading ? "Cargando..." : "Entrar"}
          </button>
          <p className="text-center mt-3">
            ¿No tienes cuenta?{" "}
            <Link href="/register" legacyBehavior>
              <a>Regístrate</a>
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}