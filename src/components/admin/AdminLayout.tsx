"use client";

import { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Container, Row, Col, Nav } from "react-bootstrap";
import AdminCalendar from "./AdminCalendar";

export default function AdminLayout() {
  const [section, setSection] = useState("reservations");

  const sections: { key: string; label: string }[] = [
    { key: "clients", label: "Clientes" },
    { key: "therapists", label: "Terapeutas" },
    { key: "reservations", label: "Reservaciones" },
    { key: "reports", label: "Reportes" },
  ];

  function renderContent() {
    if (section === "reservations") return <AdminCalendar />;
    return <p>Sección {section}</p>;
  }

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <Row>
          <Col md={2} className="mb-3">
            <Nav className="flex-column">
              {sections.map((s) => (
                <Nav.Link
                  key={s.key}
                  active={section === s.key}
                  onClick={() => setSection(s.key)}
                >
                  {s.label}
                </Nav.Link>
              ))}
            </Nav>
          </Col>
          <Col md={10}>{renderContent()}</Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
