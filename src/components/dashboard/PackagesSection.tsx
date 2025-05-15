// src/components/dashboard/PackagesSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import { FaWater, FaRunning } from "react-icons/fa";
import { GiFootprint } from "react-icons/gi";

interface PackageOption {
  label: string;
  price: number;
  priceId: string;
}
interface PackageData {
  type: "agua" | "piso" | "fisioterapia";
  title: string;
  image: string;
  options: PackageOption[];
}

const paquetesData: PackageData[] = [
  {
    type: "agua",
    title: "Estimulación temprana en agua",
    image: "/images/estimlacion_agua_animado.jpeg",
    options: [
      { label: "4 sesiones/mes (1x semana)", price: 1400, priceId: "price_1RMBAKFV5ZpZiouCCnrjam5N" },
      { label: "8 sesiones/mes (2x semana)", price: 2250, priceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU" },
      { label: "12 sesiones/mes (3x semana)", price: 2500, priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N" },
    ],
  },
  {
    type: "piso",
    title: "Estimulación temprana en piso",
    image: "/images/estimulacion_piso_animado.jpeg",
    options: [
      { label: "4 sesiones/mes (1x semana)", price: 1400, priceId: "price_1RP6S2FV5ZpZiouC6cVpXQsJ" },
      { label: "8 sesiones/mes (2x semana)", price: 2250, priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N" },
      { label: "12 sesiones/mes (3x semana)", price: 2500, priceId: "price_1RP6TaFV5ZpZiouCoG5G58S3" },
    ],
  },
  {
    type: "fisioterapia",
    title: "Fisioterapia",
    image: "/images/fisio_animado.jpeg",
    options: [
      { label: "10 sesiones", price: 3000, priceId: "price_1RP6W9FV5ZpZiouCBXnZwxLW" },
      { label: "5 sesiones", price: 2000, priceId: "price_1RP6WwFV5ZpZiouCN3m0luq3" },
    ],
  },
];

// Mapeo de iconos por tipo, usamos React.ReactNode
const iconMap: Record<PackageData["type"], React.ReactNode> = {
  agua: <FaWater size={48} />,
  piso: <GiFootprint size={48} />,
  fisioterapia: <FaRunning size={48} />,
};

export default function PackagesSection() {
  const [hasPackages, setHasPackages] = useState(false);

  useEffect(() => {
    // fetch real a /api/user/packages
    setHasPackages(false);
  }, []);

  if (!hasPackages) {
    return (
      <Container className="py-4">
        <Alert variant="info" className="text-center">
          No tienes paquetes vigentes.
        </Alert>

        {paquetesData.map((pkg) => (
          <section key={pkg.type} className="mb-5">
            <h3 className="mb-3 d-flex align-items-center gap-2">
              {iconMap[pkg.type]}
              {pkg.title}
            </h3>
            <Row className="g-4">
              {pkg.options.map((opt) => (
                <Col key={opt.priceId} xs={12} md={4}>
                  <Card className="package-card h-100 text-center">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      width={400}
                      height={200}
                      className="card-img-top"
                    />
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-2">
                        <strong>{opt.label}</strong>
                      </div>
                      <div className="mb-3">
                        <span className="h5">${opt.price.toLocaleString()}</span>
                      </div>
                      <Button
                        variant="orange"
                        className="mt-auto"
                        onClick={async () => {
                          const res = await fetch("/api/stripe/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ priceId: opt.priceId }),
                          });
                          const { sessionId } = await res.json();
                          const stripe = await loadStripe(
                            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
                          );
                          stripe?.redirectToCheckout({ sessionId });
                        }}
                      >
                        ¡Lo quiero!
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </section>
        ))}
      </Container>
    );
  }

  return <Container>{/* Mostrar paquetes reales del usuario */}</Container>;
}