"use client";
import { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";

interface Therapist {
  id: string;
  name: string;
  specialty: string | null;
  isActive: boolean;
}

export default function TherapistsSection() {
  const [list, setList] = useState<Therapist[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "" });

  const load = async (q = "") => {
    const res = await fetch(`/api/admin/therapists?search=${encodeURIComponent(q)}`);
    if (res.ok) setList(await res.json());
  };

  useEffect(() => {
    load(search);
  }, [search]);

  const createTherapist = async () => {
    const res = await fetch("/api/admin/therapists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShow(false);
      setForm({ name: "", specialty: "" });
      load();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <Button onClick={() => setShow(true)}>+ Nuevo Terapeuta</Button>
      </div>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.specialty}</td>
              <td>{t.isActive ? "Activo" : "Inactivo"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Terapeuta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Especialidad</Form.Label>
              <Form.Control value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createTherapist}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
