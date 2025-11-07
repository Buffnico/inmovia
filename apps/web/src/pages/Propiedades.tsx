import React, { useState } from "react";
import { Link } from "react-router-dom";

/* ==== Tipos ==== */
type Prop = {
  id: string;
  titulo: string;
  direccion: string;
  estado: "Activa" | "Reservada" | "Vendida";
  agente: string;
  cliente?: { nombre?: string; dni?: string; email?: string };
};

/* ==== Mock inicial ==== */
const mock: Prop[] = [
  { id: "p1", titulo: "Depto 3 amb premium", direccion: "Lomas de Zamora", estado: "Activa", agente: "Nicolás" },
  { id: "p2", titulo: "Casa 4 amb con jardín", direccion: "Banfield", estado: "Reservada", agente: "Lucía" },
];

/* ==== Modal simple para detalles de Propiedad ==== */
const PropertyModal: React.FC<{ propiedad: Prop; onClose: () => void }> = ({ propiedad, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 860 }}>
        <div className="modal-head">
          <strong>Propiedad</strong>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          {/* Tabs simples por secciones (placeholder) */}
          <div className="card" style={{ width: "100%" }}>
            <div className="card-body">
              <h2 className="page-title" style={{ marginBottom: 12 }}>{propiedad.titulo}</h2>
              <div className="grid-2">
                <div>
                  <div className="kv"><span className="k">Dirección</span><span className="v">{propiedad.direccion}</span></div>
                  <div className="kv">
                    <span className="k">Estado</span>
                    <span className={`badge ${propiedad.estado.toLowerCase()}`}>{propiedad.estado}</span>
                  </div>
                  <div className="kv"><span className="k">Agente</span><span className="v">{propiedad.agente}</span></div>
                </div>
                <div>
                  <div className="kv"><span className="k">Cliente</span><span className="v">{propiedad.cliente?.nombre ?? "—"}</span></div>
                  <div className="kv"><span className="k">DNI</span><span className="v">{propiedad.cliente?.dni ?? "—"}</span></div>
                  <div className="kv"><span className="k">Email</span><span className="v">{propiedad.cliente?.email ?? "—"}</span></div>
                </div>
              </div>

              <div className="hr" />

              <div className="tabs-row" style={{ marginBottom: 8 }}>
                <button className="btn btn-secondary">Clientes</button>
                <button className="btn btn-secondary">Fotos</button>
                <button className="btn btn-secondary">Documentación legal</button>
                <button className="btn btn-secondary">Reservas y contratos</button>
              </div>

              <div className="info muted">Aquí van los contenidos de cada sección (placeholder). Mantuvimos tu estética y componente modal flotante.</div>

              <div className="hr" />

              <div className="btn-row" style={{ justifyContent: "space-between" }}>
                <button className="btn">Transferir propiedad</button>
                <div>
                  <Link to="/documentos" className="btn">Ir a Documentos</Link>
                  <Link to="/documentos/escaner" className="btn btn-primary" style={{ marginLeft: 8 }}>
                    Abrir Escáner
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="modal-foot">
          <small>Detalle de Propiedad • Inmovia Office</small>
        </div>
      </div>
    </div>
  );
};

/* ==== Página de listado ==== */
const Propiedades: React.FC = () => {
  const [items] = useState<Prop[]>(mock);
  const [sel, setSel] = useState<Prop | null>(null);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Propiedades</h1>
        <div className="actions">
          <button className="btn btn-primary">+ Agregar propiedad</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {items.length === 0 ? (
            <div className="empty">
              <p>No hay propiedades cargadas.</p>
              <button className="btn btn-primary">Cargar primera propiedad</button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                    <th>Agente</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td>{p.titulo}</td>
                      <td>{p.direccion}</td>
                      <td><span className={`badge ${p.estado.toLowerCase()}`}>{p.estado}</span></td>
                      <td>{p.agente}</td>
                      <td className="text-right">
                        <button className="btn btn-secondary" onClick={() => setSel(p)}>Abrir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalle */}
      {sel && <PropertyModal propiedad={sel} onClose={() => setSel(null)} />}
    </div>
  );
};

export default Propiedades;
