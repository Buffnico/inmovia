import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function ClientesLista({ refreshToken, onDeleted }) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [err, setErr] = useState(null);

  const cargar = async () => {
    try {
      setCargando(true);
      setErr(null);
      const r = await fetch(`${API_URL}/api/clientes`);
      const data = await r.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setErr("No pude cargar los clientes.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [refreshToken]); // 👈 se recarga cuando cambia

  const borrar = async (id) => {
    const ok = confirm("¿Seguro que querés eliminar este cliente?");
    if (!ok) return;
    try {
      const r = await fetch(`${API_URL}/api/clientes/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.message || "No se pudo eliminar");
      }
      setItems(prev => prev.filter(c => c.id !== id));
      onDeleted?.(id);
      toast("Cliente eliminado");
    } catch (e) {
      toast(e.message || "Error al eliminar", true);
    }
  };

  const toast = (msg, error = false) => {
    const el = document.createElement("div");
    el.textContent = msg;
    el.style.position = "fixed";
    el.style.bottom = "24px";
    el.style.right = "24px";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "8px";
    el.style.background = error ? "#ffdddd" : "#ddffdd";
    el.style.border = `1px solid ${error ? "#ff9a9a" : "#8ad48a"}`;
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  };

  if (cargando) return <p>Cargando clientes…</p>;
  if (err) return <p style={{ color: "red" }}>{err}</p>;
  if (!items.length) return <p>Sin clientes cargados.</p>;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
          <th>Nombre</th><th>Apellido</th><th>DNI</th><th>Email</th><th>Teléfono</th><th></th>
        </tr>
      </thead>
      <tbody>
        {items.map(c => (
          <tr key={c.id} style={{ borderBottom: "1px solid #f3f3f3" }}>
            <td>{c.nombre}</td>
            <td>{c.apellido}</td>
            <td>{c.dni}</td>
            <td>{c.email || "-"}</td>
            <td>{c.telefono || "-"}</td>
            <td>
              <button onClick={() => borrar(c.id)} style={{ padding: "4px 8px" }}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
