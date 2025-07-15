import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '', // Añadido campo "phone"
    password: '',
    token: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía código al correo del usuario
  const handleSendToken = async () => {
    setError(null);
    setStatus("Enviando código...");

    try {
      const res = await fetch('/api/auth/request-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, checkUser: false }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setStatus("Código enviado. Revisa en tu correo📨.");
      } else {
        setError(data.error || 'Error al enviar el código.');
        setStatus(null);
      }
    } catch {
      setError('Error de red, inténtalo de nuevo.');
      setStatus(null);
    }
  };

  // Maneja creación final del usuario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setStatus("Creando cuenta...");

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.error || 'Error inesperado en el registro.');
        setStatus(null);
      }
    } catch {
      setError('Error de red, inténtalo de nuevo.');
      setStatus(null);
    }
  };

  return (
    <>
      <Head>
        <title>Registro • Bloom Fisio</title>
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      <div className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <div className="position-absolute top-0 start-0 p-3">
          <Link href="/">
            <Image
              src="/images/logo_bloom_clean.png"
              alt="Bloom Fisio"
              width={80}
              height={80}
            />
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="contact-card p-4"
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <h2 className="mb-3 text-center">Regístrate</h2>

          {error && <div className="alert alert-danger">{error}</div>}
          {status && <div className="alert alert-success">{status}</div>}

          {step === 1 && (
            <>
              <div className="form-floating mb-3">
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="name">Nombre completo</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="email">Correo electrónico</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="form-control"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="phone">Teléfono</label>
              </div>

              <button
                type="button"
                className="btn btn-orange w-100 py-2"
                onClick={handleSendToken}
              >
                Enviar código al correo
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-floating mb-3">
                <input
                  id="token"
                  name="token"
                  type="text"
                  className="form-control"
                  placeholder="Código recibido"
                  value={form.token}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="token">Código recibido</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <label htmlFor="password">Contraseña</label>
              </div>

              <button type="submit" className="btn btn-orange w-100 py-2">
                Crear cuenta
              </button>
            </>
          )}

          <p className="text-center mt-3">
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </>
  );
}
