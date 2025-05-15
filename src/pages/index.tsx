// src/pages/index.tsx
import type { NextPage } from 'next'
import Head from 'next/head'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

import NuestrosServicios from '@/components/NuestrosServicios'
import PoolSection from '@/components/PoolSection'
import ContactForm from '@/components/ContactForm'

const Home: NextPage = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleHero = (e: React.MouseEvent) => {
    e.preventDefault()
    if (session) router.push('/dashboard?tab=reservar')
    else router.push('/login')
  }

  return (
    <>
      <Head>
        <title>Bloom Fisio | Reserva tu cita</title>
        <meta
          name="description"
          content="Reserva tu sesión de fisioterapia de forma fácil y segura en Bloom Fisio."
        />
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      {/* El Navbar/​Footer global lo inyecta _app.tsx */}

      {/* Hero vacío para mostrar la imagen completa */}
      <header className="hero d-flex align-items-center justify-content-center">
        {/* nada más, la imagen centrada se ve completa */}
      </header>

      {/* Subhero: texto y botón */}
      <section id="subhero" className="subhero text-center py-5">
        <h2 className="fw-bold mb-3">Aumenta la calidad de vida en tu familia</h2>
        <p className="lead mb-4">
          Reserva tu sesión de fisioterapia de forma fácil y segura.
        </p>
        <button
  onClick={() => router.push('/dashboard?tab=reservar')}
  className="btn-hero"
>
  Agendar tu cita
  <span className="underline" />
</button>
      </section>

      <NuestrosServicios />
      <PoolSection />

      <section className="container py-5 text-center">
        <h2 className="mb-4">Recibe tips de bienestar y ofertas exclusivas</h2>
        <div className="mx-auto" style={{ maxWidth: 480 }}>
          <ContactForm />
        </div>
      </section>

      {/* El Footer global lo inyecta _app.tsx */}
    </>
  )
}

export default Home
