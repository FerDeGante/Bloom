// src/pages/login.tsx
import { useState } from "react";
import { signIn } from "next-auth/react";
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
      callbackUrl: `${window.location.origin}/dashboard?tab=reservar`,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error);
    } else if (res?.url) {
      // forzamos la navegación al dashboard
      window.location.href = res.url;
    } else {
      setError("Error desconocido, inténtalo de nuevo");
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
              <Image
                src="/images/logo_bloom_clean.png"
                alt="Bloom Fisio"
                width={80}
                height={80}
              />
            </a>
          </Link>
        </div>
        <form
          onSubmit={handleSubmit}
          className="contact-card p-4"
          style={{ width: "100%", maxWidth: 400 }}
        >
          <h2 className="mb-3 text-center">Iniciar Sesión</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-floating mb-3">
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Correo electrónico</label>
          </div>
          <div className="form-floating mb-4">
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Contraseña</label>
          </div>
          <button
            type="submit"
            className="btn btn-orange w-100 py-2"
            disabled={loading}
          >
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