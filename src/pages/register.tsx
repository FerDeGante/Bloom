import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/login');
      } else {
        const data = await res.json();
        setError(data.error || 'Ocurrió un error inesperado');
      }
    } catch {
      setError('Error de red, inténtalo de nuevo');
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

          <div className="form-floating mb-4">
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

          <p className="text-center mt-3">
            ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </form>
      </div>
    </>
  );
}
