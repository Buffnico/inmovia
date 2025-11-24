import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ==== Tipos ==== */
type Prop = {
  id: string;
  titulo: string;
  direccion: string;
  estado: "Activa" | "Reservada" | "Vendida" | "En Venta";
  agente: string;
  cliente?: { nombre?: string; dni?: string; email?: string };
  contactId?: string;
  recordarFeedback?: boolean;
  frecuenciaFeedbackDias?: number;
};

/* ==== Modal simple para detalles de Propiedad ==== */
const PropertyModal: React.FC<{ propiedad: Prop; onClose: () => void; onSave: () => void }> = ({ propiedad, onClose, onSave }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  const [recordarFeedback, setRecordarFeedback] = useState(propiedad.recordarFeedback || false);
  const [frecuencia, setFrecuencia] = useState(propiedad.frecuenciaFeedbackDias || 7);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedData = {
        ...propiedad,
        recordarFeedback,
        frecuenciaFeedbackDias: Number(frecuencia)
      };

      const res = await fetch(`${API_BASE_URL}/properties/${propiedad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Propiedad actualizada (y recordatorios de feedback ajustados).");
        onSave(); // Refrescar lista
        onClose();
      } else {
        alert("Error al guardar: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleIvotSuggestion = () => {
    // Stub para integración futura
    alert("🤖 Ivo-t: 'Hola! Aquí tienes una sugerencia de mensaje para el feedback: \n\nHola [Cliente], te cuento que esta semana tuvimos X visitas en tu propiedad...' (Funcionalidad completa próximamente)");
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 860 }}>
        <div className="modal-head">
          <strong>Propiedad</strong>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>

        <div className="modal-body" style={{ gap: 16 }}>
          <div className="card" style={{ width: "100%" }}>
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h2 className="page-title" style={{ marginBottom: 12 }}>{propiedad.titulo}</h2>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>

              <div className="grid-2">
                <div>
                  <div className="kv"><span className="k">Dirección</span><span className="v">{propiedad.direccion}</span></div>
                  <div className="kv">
                    <span className="k">Estado</span>
                    <span className={`badge ${propiedad.estado.toLowerCase().replace(' ', '-')}`}>{propiedad.estado}</span>
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

              {/* Sección de Feedback */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>🔄 Gestión de Feedback a Cliente</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

                  {/* Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '24px' }}>
                      <input
                        type="checkbox"
                        checked={recordarFeedback}
                        onChange={(e) => setRecordarFeedback(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: recordarFeedback ? 'var(--inmovia-primary)' : '#ccc',
                        transition: '.4s', borderRadius: '34px'
                      }}>
                        <span style={{
                          position: 'absolute', content: "", height: '16px', width: '16px', left: '4px', bottom: '4px',
                          backgroundColor: 'white', transition: '.4s', borderRadius: '50%',
                          transform: recordarFeedback ? 'translateX(16px)' : 'translateX(0)'
                        }} />
                      </span>
                    </label>
                    <span style={{ fontSize: '0.9rem' }}>Recordar enviar feedback</span>
                  </div>

                  {/* Frecuencia */}
                  {recordarFeedback && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>Cada:</span>
                      <select
                        value={frecuencia}
                        onChange={(e) => setFrecuencia(Number(e.target.value))}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      >
                        <option value={7}>7 días</option>
                        <option value={15}>15 días</option>
                      </select>
                    </div>
                  )}

                  {/* Botón Ivo-t */}
                  <button
                    className="btn btn-secondary"
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={handleIvotSuggestion}
                  >
                    🤖 Sugerir texto con Ivo-t
                  </button>
                </div>
              </div>

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
  const [items, setItems] = useState<Prop[]>([]);
  const [sel, setSel] = useState<Prop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProperties = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/properties`)
      .then(res => res.json())
      .then(data => {
        if (data.ok) setItems(data.data);
      })
      .catch(err => console.error("Error fetching properties:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProperties();
  }, []);

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
          {loading ? (
            <p>Cargando propiedades...</p>
          ) : items.length === 0 ? (
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
                      <td><span className={`badge ${p.estado.toLowerCase().replace(' ', '-')}`}>{p.estado}</span></td>
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
      {sel && <PropertyModal propiedad={sel} onClose={() => setSel(null)} onSave={() => { fetchProperties(); }} />}
    </div>
  );
};

export default Propiedades;
