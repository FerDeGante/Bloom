"use client";

import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Container, Row, Col, Nav, Dropdown } from "react-bootstrap";
import { useSession, signOut } from "next-auth/react";
import {
  FaUsers,
  FaUserMd,
  FaCalendarAlt,
  FaCalendarPlus,
  FaChartBar,
  FaCog,
} from "react-icons/fa";
import CalendarSection from "./CalendarSection";
import ManualReservationSection from "./ManualReservationSection";
import ClientsSection from "./ClientsSection";
import TherapistsSection from "./TherapistsSection";

export default function AdminLayout() {
  const [section, setSection] = useState("manual");
  const { data: session } = useSession();

  const sections: { key: string; label: string; icon: React.ReactElement }[] = [
    { key: "clients", label: "Clientes", icon: <FaUsers className="me-2" /> },
    { key: "therapists", label: "Terapeutas", icon: <FaUserMd className="me-2" /> },
    { key: "manual", label: "Generar reservación", icon: <FaCalendarPlus className="me-2" /> },
    { key: "calendar", label: "Calendario", icon: <FaCalendarAlt className="me-2" /> },
    { key: "reports", label: "Reportes", icon: <FaChartBar className="me-2" /> },
    { key: "settings", label: "Configuración", icon: <FaCog className="me-2" /> },
  ];

  function renderContent() {
    switch (section) {
      case "clients":
        return <ClientsSection />;
      case "therapists":
        return <TherapistsSection />;
      case "manual":
        return <ManualReservationSection />;
      case "calendar":
        return <CalendarSection />;
      case "reports":
        return <p>Reportes</p>;
      default:
        return <p>Sección {section}</p>;
    }
  }

  return (
    <>
      <Navbar />
      <Container fluid className="py-4">
        <Row className="mb-3">
          <Col className="d-flex justify-content-end">
            {session && (
              <Dropdown>
                <Dropdown.Toggle variant="light" id="dd-admin">
                  {session.user?.name}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end">
                  <Dropdown.Item onClick={() => signOut({ callbackUrl: "/" })}>
                    Cerrar sesión
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Col>
        </Row>
        <Row>
          <Col md={2} className="mb-3">
            <Nav className="flex-column">
              {sections.map((s) => (
                <Nav.Link
                  key={s.key}
                  active={section === s.key}
                  onClick={() => setSection(s.key)}
                  className="d-flex align-items-center"
                >
                  {s.icon}
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
