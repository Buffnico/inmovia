import { API_URL } from "../config";

export default function ClientesLista({ items, onDeleted }) {
  const borrar = async (id) => {
    const ok = confirm("¿Seguro que querés eliminar este cliente?");
    if (!ok) return;
    try {
      const r = await fetch(`${API_URL}/api/clientes/${id}`, { method: "DELETE" });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.message || "No se pudo eliminar");
      }
      onDeleted?.(id); // 👈 actualiza estado en App al instante
    } catch (e) {
      alert(e.message || "Error al eliminar");
    }
  };

  if (!items?.length) return <p>Sin clientes cargados.</p>;

  return (
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr style={{ textAlign:"left", borderBottom:"1px solid #eee" }}>
          <th>Nombre</th><th>Apellido</th><th>DNI</th><th>Email</th><th>Teléfono</th><th></th>
        </tr>
      </thead>
      <tbody>
        {items.map(c => (
          <tr key={c.id} style={{ borderBottom:"1px solid #f3f3f3" }}>
            <td>{c.nombre}</td>
            <td>{c.apellido}</td>
            <td>{c.dni}</td>
            <td>{c.email || "-"}</td>
            <td>{c.telefono || "-"}</td>
            <td><button onClick={() => borrar(c.id)}>Eliminar</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
