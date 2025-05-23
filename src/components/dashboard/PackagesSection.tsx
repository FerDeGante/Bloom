"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import PackageCard, { Package } from "../PackageCard";

// — Paquetes principales —
const paquetesPrincipales: Package[] = [
  {
    id: "agua_1",
    title: "Estimulación temprana en agua (1×mes)",
    sessions: 1,
    inscription: 30,
    price: 500,
    description:
      "Sesión individual para el desarrollo 👶 con ejercicios y juegos en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RJd0OFV5ZpZiouCasDGf28F",
  },
  {
    id: "agua_4",
    title: "Estimulación temprana en agua (4×mes)",
    sessions: 4,
    inscription: 30,
    price: 1400,
    description:
      "Un encuentro semanal para desarrollo 👶 con ejercicios en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBAKFV5ZpZiouCCnrjam5N",
  },
  {
    id: "agua_8",
    title: "Estimulación temprana en agua (8×mes)",
    sessions: 8,
    inscription: 30,
    price: 2250,
    description:
      "Dos sesiones semanales para mayor progreso 👶💦 en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU",
  },
  {
    id: "agua_12",
    title: "Estimulación temprana en agua (12×mes)",
    sessions: 12,
    inscription: 30,
    price: 2500,
    description:
      "Tres sesiones semanales para avance constante 👶💦 en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N",
  },
  // ... más paquetes principales
];

// — “Otros servicios” (1 sesión, vigencia 30 días) —
const otrosServicios: Package[] = [
  {
    id: "post_vacuna",
    title: "Terapia post vacuna",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Alivia molestias tras vacunación 💉",
    image: "/images/post_vacuna_animado.jpeg",
    priceId: "prod_SIyvmx4o5kkTKJ",
  },
  {
    id: "quiropractica",
    title: "Quiropráctica",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Ajustes para tu columna 🦴",
    image: "/images/quiro_animado.jpeg",
    priceId: "prod_SE5DojRCwzy37u",
  },
  {
    id: "masajes",
    title: "Masajes",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Relaja cuerpo y mente 💆‍♀️",
    image: "/images/masajes_animado.jpeg",
    priceId: "prod_SE5EcuLUlnoMo9",
  },
  // ... resto de “Otros servicios”
];

export default function PackagesSection() {
  const router = useRouter();

  const handleBuy = (
    priceId: string,
    pkgId: string,
    sessions: number,
    title: string
  ) => {
    router.push(
      {
        pathname: "/dashboard",
        query: {
          view: "reservar-paquete",
          type: pkgId,
          sessions,
          priceId,
          title, // enviamos el título real
        },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Nuestros paquetes</h2>
      <Row className="g-4 mb-5">
        {paquetesPrincipales.map((pkg) => (
          <Col key={pkg.priceId} md={3}>
            <PackageCard
              pkg={pkg}
              onBuy={() =>
                handleBuy(pkg.priceId, pkg.id, pkg.sessions!, pkg.title)
              }
            />
          </Col>
        ))}
      </Row>

      <h2 className="mb-4">Otros servicios</h2>
      <Row className="g-4">
        {otrosServicios.map((svc) => (
          <Col key={svc.priceId} md={3}>
            <PackageCard
              pkg={svc}
              onBuy={() =>
                handleBuy(svc.priceId, svc.id, svc.sessions!, svc.title)
              }
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
