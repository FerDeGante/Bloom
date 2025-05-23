// src/components/dashboard/PurchasedPackagesSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Container, Alert, ListGroup, Button, Spinner } from "react-bootstrap";
import { useRouter } from "next/router";

interface UserPkg {
  id: string;
  pkgName: string;
  sessionsRemaining: number;
  expiresAt: string;
}

export default function PurchasedPackagesSection() {
  const [pkgs, setPkgs] = useState<UserPkg[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/packages")
      .then((res) => res.json())
      .then((data: UserPkg[]) => setPkgs(data))
      .catch(() => setPkgs([]));
  }, []);

  if (pkgs === null) return <Spinner className="m-5" animation="border" />;

  if (pkgs.length === 0) {
    return (
      <Container className="py-4 text-center">
        <div className="mb-3">
          <Image
            src="/images/no_tienes_paquetes_vigentes.png"
            alt="No tienes paquetes vigentes"
            width={200}
            height={200}
            className="no-paquetes-img"
          />
        </div>
        <Alert variant="info">No tienes paquetes vigentes.</Alert>
        <Button
          onClick={() => router.push("/dashboard?tab=reservar")}
          variant="primary"
        >
          Comprar paquete
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h4 className="mb-3">Mis paquetes</h4>
      <ListGroup>
        {pkgs.map((p) => (
          <ListGroup.Item
            key={p.id}
            className="d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{p.pkgName}</strong>
              <br />
              Sesiones restantes: {p.sessionsRemaining}
              <br />
              Vence: {new Date(p.expiresAt).toLocaleDateString()}
            </div>
            <Button
              variant="success"
              onClick={() => router.push("/dashboard?tab=reservar")}
            >
              Comprar paquete
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}
