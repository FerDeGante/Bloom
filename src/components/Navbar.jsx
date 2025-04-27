"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Navbar as BSNavbar,
  Nav,
  Container,
  NavDropdown,
} from "react-bootstrap";
import {
  FaInfoCircle,
  FaCalendarAlt,
  FaServicestack,
} from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const servicios = [
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
  ];

  return (
    <BSNavbar
      sticky="top"
      expand="lg"
      className={`py-3 ${scrolled ? "navbar-scrolled" : "navbar-base"}`}
    >
      <Container>
        {/* Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center gap-2">
          <Image
            src="/images/logo_bloom_clean.png"
            alt="Bloom"
            width={105}
            height={105}
            className="logo-img"
            priority
          />
        </Link>

        {/* Toggle hamburguesa */}
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto gap-3 align-items-center">
            <Link href="/nosotros" className="nav-link d-flex align-items-center">
              <FaInfoCircle className="me-1" />
              Nosotros
            </Link>

            <Link href="/citas" className="nav-link d-flex align-items-center">
              <FaCalendarAlt className="me-1" />
              Citas
            </Link>

            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <FaServicestack className="me-1" />
                  Servicios
                </span>
              }
              id="servicios-dd"
              menuVariant="light"
              align="end"               /* ← Ensambla el menú hacia la izquierda */
              className="nav-link"
            >
              {servicios.map(([slug, label]) => (
                <Link
                  key={slug}
                  href={`/servicios/${slug}`}
                  className="dropdown-item"
                >
                  {label}
                </Link>
              ))}
            </NavDropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
