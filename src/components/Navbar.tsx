"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { FaInfoCircle, FaCalendarAlt, FaSignInAlt, FaUser } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToReservas = () => {
    if (session) {
      router.push("/reservasform");
    } else {
      router.push("/login?redirect=/reservasform");
    }
  };

  return (
    <BSNavbar
      sticky="top"
      expand="lg"
      className={scrolled ? "navbar-scrolled" : "navbar-base"}
    >
      <Container>
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <Image
            src="/images/logo_bloom_white.png"
            alt="Logo Bloom"
            width={150}
            height={150}
            className="logo-img"
            priority
          />
        </Link>

        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto gap-3 align-items-center">
            {/* Botón Agendar */}
            <button
              type="button"
              className="nav-link btn btn-link d-flex align-items-center"
              onClick={goToReservas}
            >
              <FaCalendarAlt className="me-1" />
              Agendar
            </button>

            {/* Enlace Nosotros */}
            <Link href="/nosotros" className="nav-link d-flex align-items-center">
              <FaInfoCircle className="me-1" />
              Nosotros
            </Link>

            {/* Enlace Iniciar sesión */}
            {!session && (
              <Link href="/login" className="nav-link d-flex align-items-center">
                <FaSignInAlt className="me-1" />
                Iniciar sesión
              </Link>
            )}

            {/* Dropdown para usuarios autenticados */}
            {session && (
              <NavDropdown
                title={
                  <span className="d-flex align-items-center">
                    <FaUser className="me-1" />
                    {session.user?.name}
                  </span>
                }
                id="user-dd"
                align="end"
                menuVariant="light"
                className="nav-link"
              >
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => router.push("/dashboard")}
                >
                  Mi Dashboard
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Cerrar sesión
                </button>
              </NavDropdown>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
// quiero que eliminemos "agendar" del navbar y lo cambiemos por "reservas" y que el icono sea un calendario