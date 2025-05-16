"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/router";

interface PackageOption {
  label: string;
  price: number;
  priceId: string;
  sessions: number;
}
interface PackageData {
  type: string;
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
      { label: "1 sesión (1 mes)", price: 500,  priceId: "price_1RJd0OFV5ZpZiouCasDGf28F", sessions: 1 },
      { label: "4 sesiones/mes (1×sem)", price: 1400, priceId: "price_1RMBAKFV5ZpZiouCCnrjam5N", sessions: 4 },
      { label: "8 sesiones/mes (2×sem)", price: 2250, priceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU", sessions: 8 },
      { label: "12 sesiones/mes (3×sem)", price: 2500, priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N", sessions: 12 },
    ],
  },
  {
    type: "piso",
    title: "Estimulación temprana en piso",
    image: "/images/estimulacion_piso_animado.jpeg",
    options: [
      { label: "1 sesión (1 mes)", price: 500,  priceId: "price_1RJd1jFV5ZpZiouC1xXvllVc", sessions: 1 },
      { label: "4 sesiones/mes (1×sem)", price: 1400, priceId: "price_1RP6S2FV5ZpZiouC6cVpXQsJ", sessions: 4 },
      { label: "8 sesiones/mes (2×sem)", price: 2250, priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N", sessions: 8 },
      { label: "12 sesiones/mes (3×sem)", price: 2500, priceId: "price_1RP6TaFV5ZpZiouCoG5G58S3", sessions: 12 },
    ],
  },
  {
    type: "fisioterapia",
    title: "Fisioterapia",
    image: "/images/fisio_animado.jpeg",
    options: [
      { label: "1 sesión",    price: 0,    priceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU", sessions: 1 },
      { label: "5 sesiones",  price: 2000, priceId: "price_1RP6WwFV5ZpZiouCN3m0luq3", sessions: 5 },
      { label: "10 sesiones", price: 3000, priceId: "price_1RP6W9FV5ZpZiouCBXnZwxLW", sessions: 10 },
    ],
  },
];

export default function PackagesSection() {
  const [hasPackages, setHasPackages] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
            <h4 className="mb-3">{pkg.title}</h4>
            <Row className="g-4">
              {pkg.options.map((opt) => (
                <Col key={opt.priceId} md={3}>
                  <Card className="package-card servicio-card h-100 shadow-sm">
                    <div className="card-img-wrap">
                      <Image
                        src={pkg.image}
                        alt={opt.label}
                        layout="responsive"
                        width={400}
                        height={200}
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{opt.label}</Card.Title>
                      <Card.Text className="mb-4">
                        <strong>${opt.price.toLocaleString()}</strong>
                      </Card.Text>
                      <Button
                        variant="orange"
                        className="mt-auto"
                        onClick={() =>
                          router.push(
                            {
                              pathname: "/dashboard",
                              query: {
                                view: "reservar-paquete",
                                type: pkg.type,
                                sessions: opt.sessions,
                                priceId: opt.priceId,
                              },
                            },
                            undefined,
                            { shallow: true }
                          )
                        }
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

  return <Container>{/* … paquetes activos … */}</Container>;
}