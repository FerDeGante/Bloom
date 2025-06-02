"use client";
import { useEffect, useState } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

export default function ClientsSection() {
  const [list, setList] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const load = async (q = "") => {
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(q)}`);
    if (res.ok) setList(await res.json());
  };

  useEffect(() => {
    load(search);
  }, [search]);

  const createClient = async () => {
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShow(false);
      setForm({ name: "", email: "", phone: "", password: "" });
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
        <Button onClick={() => setShow(true)}>+ Nuevo Cliente</Button>
      </div>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Cliente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Correo</Form.Label>
              <Form.Control value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={createClient}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
