"use client";
import { useEffect, useState } from "react";

export default function HistorySection() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("/api/appointments/history")
      .then(r=>r.json())
      .then(setHistory);
  },[]);

  if (!history.length) return <p>No tienes reservas aún.</p>;

  return (
    <ul className="list-group">
      {history.map(r=>(
        <li className="list-group-item" key={r.id}>
          {new Date(r.date).toLocaleString()} — {r.serviceName} con {r.therapistName}
        </li>
      ))}
    </ul>
  );
}
