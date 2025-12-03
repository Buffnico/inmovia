import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ImportarModal from "../components/Propiedades/ImportarModal";
import "./Propiedades.css";

/* ==== Tipos ==== */
export type Propiedad = {
  id: string;
  mlsid?: string;
  titulo: string;
  direccion: string;
  localidad?: string;
  barrio?: string;
  precio?: number;
  monedaPrecio?: string;
  ambientes?: number;
  dormitorios?: number;
  supCubierta?: number;
  supDescubierta?: number;
  estado: "Activa" | "Reservada" | "Vendida" | "En Venta" | "Alquilada" | "Suspendida";
  tipoOperacion?: string;
  tipoPropiedad?: string;
  agente: string;
  assignedAgentId?: string;
  oficina?: string;
  cocheras?: number;
  antiguedad?: number;
  descripcion?: string;
  fechaCaptacion?: string;
  cartel?: boolean;
  diasEnMercado?: number;
  propietario?: {
    nombre: string;
    email: string;
    celular: string;
  };
  contactId?: string;
};

import { apiFetch } from "../services/apiClient";
import { useAuth } from "../store/auth";

const Propiedades: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterOperacion, setFilterOperacion] = useState("Todos");
  const [filterTipo, setFilterTipo] = useState("Todos");

  const fetchProperties = () => {
    setLoading(true);
    // apiFetch automatically adds token from localStorage
    apiFetch("/properties")
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

  // Lógica de filtrado simple
  const filteredItems = items.filter(p => {
    const matchesSearch = p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      p.direccion.toLowerCase().includes(search.toLowerCase()) ||
      p.mlsid?.toLowerCase().includes(search.toLowerCase());

    const matchesOperacion = filterOperacion === "Todos" || p.tipoOperacion === filterOperacion;
    const matchesTipo = filterTipo === "Todos" || p.tipoPropiedad === filterTipo;

    return matchesSearch && matchesOperacion && matchesTipo;
  });

  return (
    <div className="page">
      <div className="propiedades-layout">
        <div className="page-header">
          <div>
            <h1 className="page-title">Propiedades</h1>
            <p className="text-muted">Gestión de inventario y publicaciones</p>
          </div>
          <div className="actions">
            {user?.role !== 'AGENTE' && user?.role !== 'RECEPCIONISTA' && (
              <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>
                📥 Importar CSV (RE/MAX)
              </button>
            )}
            <Link to="/carteles" className="btn btn-outline-primary">
              🚩 Ver Carteles
            </Link>
            <Link to="/propiedades/nueva" className="btn btn-primary">
              + Nueva Propiedad
            </Link>
          </div>
        </div>

        {user?.role === 'AGENTE' && (
          <div className="alert alert-info mb-4" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '1rem', borderRadius: '0.5rem' }}>
            ℹ️ <strong>Mostrando solo tus propiedades asignadas.</strong> Como agente, solo podés ver y gestionar las propiedades bajo tu responsabilidad.
          </div>
        )}

        {/* Filtros */}
        <div className="card filters-card">
          <div className="card-body" style={{ padding: '1rem' }}>
            <div className="filters-row">
              <div style={{ flex: 1, minWidth: '200px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por dirección, título o MLSID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <select
                className="form-select"
                value={filterOperacion}
                onChange={(e) => setFilterOperacion(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Todos">Todas las operaciones</option>
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Alquiler Temporal">Temporal</option>
              </select>

              <select
                className="form-select"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                <option value="Todos">Todos los tipos</option>
                <option value="Departamento">Departamento</option>
                <option value="Casa">Casa</option>
                <option value="PH">PH</option>
                <option value="Terreno">Terreno</option>
                <option value="Local">Local</option>
                <option value="Oficina">Oficina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Propiedades */}
        {loading ? (
          <div className="loading-state">Cargando propiedades...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state card">
            <div className="card-body text-center" style={{ padding: '3rem' }}>
              <h3>No se encontraron propiedades</h3>
              <p className="text-muted">Probá ajustando los filtros o importá nuevas propiedades.</p>
            </div>
          </div>
        ) : (
          <div className="properties-grid">
            {filteredItems.map((p) => (
              <div key={p.id} className="property-card">
                {/* Imagen Placeholder */}
                <div className="card-img-top">
                  <div className="card-badges">
                    <span className={`badge ${p.tipoOperacion === 'Venta' ? 'badge-success' : 'badge-info'}`}>
                      {p.tipoOperacion || 'Venta'}
                    </span>
                    <span className="badge badge-dark">
                      {p.estado}
                    </span>
                  </div>
                  <div>📷 Sin foto</div>
                </div>

                <div className="card-body">
                  <div>
                    <h3 className="prop-price">
                      {p.monedaPrecio} {p.precio?.toLocaleString()}
                    </h3>
                    <div className="prop-address">
                      {p.direccion}
                    </div>
                  </div>

                  <div className="features-row">
                    <span>{p.supCubierta ? `${p.supCubierta}m²` : '-'}</span>
                    <span>•</span>
                    <span>{p.ambientes ? `${p.ambientes} amb` : '-'}</span>
                    <span>•</span>
                    <span>{p.dormitorios ? `${p.dormitorios} dorm` : '-'}</span>
                  </div>

                  <div className="card-footer">
                    <div className="agent-info">
                      <div className="agent-avatar"></div>
                      <span className="agent-name">{p.agente}</span>
                    </div>
                    <Link to={`/propiedades/${p.id}`} className="btn btn-sm btn-outline-primary">
                      Ver ficha
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportarModal
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              setShowImportModal(false);
              fetchProperties();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Propiedades;
