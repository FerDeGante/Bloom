// src/pages/admin/reports.tsx
import React from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Chart, Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import StatsCard from "@/components/admin/StatsCard";
import { useAdminStats } from "@/hooks/useAdminStats";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminReportsPage() {
  const { data, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" /> Cargando reportes…
      </Container>
    );
  }
  if (error || !data) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">
          Error al cargar reportes.
        </div>
      </Container>
    );
  }

  const { activeMembers, packagesSoldThisMonth, reservationsThisMonth, monthlyRevenue } = data;

  const chartData = {
    labels: monthlyRevenue.map((m) => m.month),
    datasets: [
      {
        label: "Ingresos",
        data: monthlyRevenue.map((m) => m.revenue),
        fill: false,
        tension: 0.3,
        borderColor: "#60bac2", // verde Bloom
      }
    ]
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Reportes</h1>

      {/* 4 tarjetas resumen */}
      <Row className="g-3 mb-5">
        <Col md={3}><StatsCard title="Miembros activos" value={activeMembers} /></Col>
        <Col md={3}><StatsCard title="Paquetes vendidos (mes)" value={packagesSoldThisMonth} /></Col>
        <Col md={3}><StatsCard title="Reservas (mes)" value={reservationsThisMonth} /></Col>
        <Col md={3}><StatsCard title="Ingreso total (6m)" value={monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0)} /></Col>
      </Row>

      {/* Gráfico de Ingresos Mensuales */}
      <Row>
        <Col>
          <h4>Ingresos Mensuales (últimos 6 meses)</h4>
          <Line data={chartData} />
        </Col>
      </Row>
    </Container>
  );
}
