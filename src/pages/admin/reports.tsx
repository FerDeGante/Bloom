// src/pages/admin/reports.tsx
import React from "react";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import StatsCard from "@/components/admin/StatsCard";
import { useAdminStats } from "@/hooks/useAdminStats";
import { User, Calendar, CheckCircle, DollarSign } from "react-feather";

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
        <div className="alert alert-danger">Error al cargar reportes.</div>
      </Container>
    );
  }

  const {
    activeMembers,
    packagesSoldThisMonth,
    reservationsThisMonth,
    monthlyRevenue
  } = data;

  // Preparamos los datos de las 4 tarjetas, incluyendo el icono
  const stats = [
    {
      title: "Miembros activos",
      value: activeMembers,
      icon: <User size={20} />
    },
    {
      title: "Paquetes vendidos (mes)",
      value: packagesSoldThisMonth,
      icon: <Calendar size={20} />
    },
    {
      title: "Reservas (mes)",
      value: reservationsThisMonth,
      icon: <CheckCircle size={20} />
    },
    {
      title: "Ingreso total (6m)",
      value: monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0),
      icon: <DollarSign size={20} />
    }
  ];

  const chartData = {
    labels: monthlyRevenue.map((m) => m.month),
    datasets: [
      {
        label: "Ingresos",
        data: monthlyRevenue.map((m) => m.revenue),
        fill: false,
        tension: 0.3,
        borderColor: "#60bac2" // verde Bloom
      }
    ]
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Reportes</h1>

      {/* 4 tarjetas resumen */}
      <Row className="g-3 mb-5">
        {stats.map((stat, idx) => (
          <Col md={3} key={idx}>
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          </Col>
        ))}
      </Row>

      {/* Gráfico de ingresos mensuales */}
      <Row>
        <Col>
          <h4>Ingresos Mensuales (últimos 6 meses)</h4>
          <Line data={chartData} />
        </Col>
      </Row>
    </Container>
  );
}
