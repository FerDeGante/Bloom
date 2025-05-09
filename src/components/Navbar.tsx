"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar as BSNavbar, Nav, Container, NavDropdown } from "react-bootstrap";
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaServicestack,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (path, tab) => {
    if (session) {
      if (tab) router.push(`/dashboard?tab=${tab}`);
      else router.push(path);
    } else {
      router.push("/login");
    }
  };

  return (
    <BSNavbar
      sticky="top"
      expand="lg"
      className={`navbar-base py-2 ${scrolled ? "navbar-scrolled" : ""}`}
    >
      <Container>
        <Link href="/" className="navbar-brand d-flex align-items-center">
          <Image
            src="/images/logo_bloom_white.png"
            alt="Bloom Fisio"
            width={150}
            height={40}
            className="logo-img"
            priority
          />
        </Link>

        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Link href="/nosotros" className="nav-link">
              <FaInfoCircle className="me-1" /> Nosotros
            </Link>

            <a
              className="nav-link"
              style={{ cursor: "pointer" }}
              onClick={() => go("/dashboard", "reservar")}
            >
              <FaCalendarAlt className="me-1" /> Agendar
            </a>

            <NavDropdown
              title={<span><FaServicestack className="me-1" /> Servicios</span>}
              id="servicios-dd"
              align="end"
              menuVariant="dark"
            >
              {[
                ["agua", "Estimulación en agua"],
                ["piso", "Estimulación en piso"],
                ["quiropráctica", "Quiropráctica"],
                ["fisioterapia", "Fisioterapia"],
                ["masajes", "Masajes"],
                ["cosmetología", "Cosmetología"],
                ["prevencion-lesiones", "Prevención de lesiones"],
                ["preparacion-fisica", "Preparación física"],
                ["nutricion", "Nutrición"],
                ["medicina-rehabilitacion", "Medicina en rehabilitación"],
              ].map(([key, label]) => (
                <a
                  key={key}
                  className="dropdown-item"
                  onClick={() => go("/dashboard", "reservar")}
                >
                  {label}
                </a>
              ))}
            </NavDropdown>

            {!session ? (
              <Link href="/login" className="nav-link">
                <FaSignInAlt className="me-1" /> Iniciar sesión
              </Link>
            ) : (
              <NavDropdown
                title={<span><FaUser className="me-1" /> {session.user.name}</span>}
                id="user-dd"
                align="end"
                menuVariant="dark"
              >
                <a className="dropdown-item" onClick={() => go("/dashboard")}>
                  Mi dashboard
                </a>
                <button
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
