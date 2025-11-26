import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";
import ScannerModalModern from "../scanner/components/ScannerModalModern";

// --- Mocks & Types ---

type DocStatus = "firmado" | "pendiente" | "borrador" | "revision";
type DocType = "pdf" | "docx" | "jpg" | "folder";

interface DocumentMock {
  id: string;
  name: string;
  type: DocType;
  category: string;
  date: string;
  size: string;
  status: DocStatus;
  property?: string;
}

const MOCK_DOCS: DocumentMock[] = [
  { id: "d1", name: "Contrato de Alquiler - Gurruchaga", type: "pdf", category: "Contratos", date: "Hoy, 10:30", size: "2.4 MB", status: "pendiente", property: "Gurruchaga 1234" },
  { id: "d2", name: "Reserva - Los Castores", type: "pdf", category: "Contratos", date: "Ayer, 15:45", size: "1.1 MB", status: "firmado", property: "Barrio Los Castores" },
  { id: "d3", name: "DNI Titular (Frente)", type: "jpg", category: "Identidad", date: "22 Nov, 09:15", size: "3.5 MB", status: "revision", property: "Zapiola 800" },
  { id: "d4", name: "Escritura Original", type: "pdf", category: "Legal", date: "20 Nov, 11:00", size: "8.2 MB", status: "firmado", property: "Gurruchaga 1234" },
  { id: "d5", name: "Borrador - Autorización Venta", type: "docx", category: "Borradores", date: "18 Nov, 14:20", size: "450 KB", status: "borrador" },
];

const CATEGORIES = ["Todos", "Contratos", "Identidad", "Legal", "Planos", "Borradores"];

// --- Componente Principal ---

export default function Documentos() {
  // Estado del escáner
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);

  // Configuración
  const [useLegacyScanner, setUseLegacyScanner] = useState(false);

  // Estado de la UI
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // File input para “Cargar documento”
  const fileRef = useRef<HTMLInputElement | null>(null);

  // --- Funciones del Escáner ---
  function openScanEmpty() {
    setInitialFiles([]);
    setIsScanOpen(true);
  }

  function onPickFiles() {
    fileRef.current?.click();
  }

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files;
    if (!fs || fs.length === 0) return;
    setInitialFiles(Array.from(fs));
    setIsScanOpen(true);
    e.currentTarget.value = "";
  }

  // --- Filtrado ---
  const filteredDocs = MOCK_DOCS.filter(doc => {
    const matchesCategory = activeCategory === "Todos" || doc.category === activeCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.property && doc.property.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // --- Helpers de UI ---
  const getStatusColor = (status: DocStatus) => {
    switch (status) {
      case "firmado": return "bg-green-100 text-green-700 border-green-200";
      case "pendiente": return "bg-amber-100 text-amber-700 border-amber-200";
      case "borrador": return "bg-gray-100 text-gray-600 border-gray-200";
      case "revision": return "bg-blue-100 text-blue-700 border-blue-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getTypeIcon = (type: DocType) => {
    switch (type) {
      case "pdf": return "📄";
      case "docx": return "📝";
      case "jpg": return "🖼️";
      case "folder": return "📁";
      default: return "📄";
    }
  };

  return (
    <div className="page-inner documentos-page">
      <style>{`
        /* Estilos Locales Documentos (Inmovia Style) */
        .docs-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          grid-template-rows: auto 1fr;
          gap: 2rem;
          height: calc(100vh - 140px);
        }

        @media (max-width: 1024px) {
          .docs-layout {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
            height: auto;
          }
        }

        /* Sidebar de Filtros */
        .docs-sidebar {
          background: white;
          border-radius: 1.5rem;
          padding: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .category-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--inmovia-text-muted);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 0.25rem;
        }
        .category-btn:hover {
          background: #f1f5f9;
          color: var(--inmovia-text-main);
        }
        .category-btn.active {
          background: var(--inmovia-primary-soft);
          color: var(--inmovia-primary-strong);
          font-weight: 600;
        }
        .category-count {
          background: rgba(0,0,0,0.05);
          padding: 0.1rem 0.5rem;
          border-radius: 99px;
          font-size: 0.75rem;
        }

        /* Área Principal */
        .docs-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
          overflow: hidden;
        }

        /* Herramientas Rápidas */
        .tools-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }
        .tool-card {
          background: white;
          padding: 1.25rem;
          border-radius: 1.25rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .tool-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          border-color: var(--inmovia-primary-soft);
        }
        .tool-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .tool-title {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--inmovia-text-main);
        }
        .tool-desc {
          font-size: 0.8rem;
          color: var(--inmovia-text-muted);
          line-height: 1.3;
        }

        /* Tabla de Documentos */
        .docs-table-container {
          background: white;
          border-radius: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.8);
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .docs-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .search-input {
          padding: 0.5rem 1rem;
          border-radius: 99px;
          border: 1px solid rgba(203, 213, 225, 0.8);
          font-size: 0.9rem;
          width: 250px;
          outline: none;
        }
        .search-input:focus {
          border-color: var(--inmovia-primary);
        }

        .table-scroll {
          overflow-y: auto;
          flex: 1;
        }
        .docs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .docs-table th {
          text-align: left;
          padding: 1rem 1.5rem;
          font-size: 0.85rem;
          color: var(--inmovia-text-muted);
          font-weight: 600;
          background: #f8fafc;
          position: sticky;
          top: 0;
        }
        .docs-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
          color: var(--inmovia-text-main);
        }
        .docs-table tr:hover {
          background: #f8fafc;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid transparent;
          text-transform: capitalize;
        }
        
        /* Colores de estado (Tailwind-like) */
        .bg-green-100 { background-color: #dcfce7; }
        .text-green-700 { color: #15803d; }
        .border-green-200 { border-color: #bbf7d0; }
        
        .bg-amber-100 { background-color: #fef3c7; }
        .text-amber-700 { color: #b45309; }
        .border-amber-200 { border-color: #fde68a; }
        
        .bg-gray-100 { background-color: #f3f4f6; }
        .text-gray-600 { color: #4b5563; }
        .border-gray-200 { border-color: #e5e7eb; }

        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-700 { color: #1d4ed8; }
        .border-blue-200 { border-color: #bfdbfe; }

        .action-btn-mini {
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background: white;
          cursor: pointer;
          font-size: 0.8rem;
          margin-right: 0.5rem;
          transition: all 0.2s;
        }
        .action-btn-mini:hover {
          background: #f1f5f9;
          border-color: var(--inmovia-primary);
        }
        
        /* Toggle Switch */
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--inmovia-text-muted);
        }
        .toggle-track {
          width: 36px;
          height: 20px;
          background: #cbd5e1;
          border-radius: 99px;
          position: relative;
          transition: all 0.2s;
        }
        .toggle-track.checked {
          background: var(--inmovia-primary);
        }
        .toggle-thumb {
          width: 16px;
          height: 16px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .toggle-track.checked .toggle-thumb {
          transform: translateX(16px);
        }

      `}</style>

      <div className="page-header">
        <div>
          <h1 className="page-title">Hub de Documentos</h1>
          <p className="page-subtitle">
            Gestioná contratos, escrituras y documentación de clientes en un solo lugar.
          </p>
        </div>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">
            Volver al Dashboard
          </Link>
        </div>
      </div>

      <div className="docs-layout">

        {/* HERRAMIENTAS RÁPIDAS (Moved to top) */}
        <section className="tools-grid">
          {/* 1. Nuevo Contrato */}
          <div className="tool-card" onClick={() => alert("🤖 Asistente de Contratos: Seleccioná una plantilla (Alquiler, Venta, Reserva) para comenzar.")}>
            <div className="tool-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📄</div>
            <div>
              <div className="tool-title">Nuevo Contrato</div>
              <div className="tool-desc">Usar plantillas inteligentes</div>
            </div>
          </div>

          {/* 2. Escáner (Funcional) */}
          <div className="tool-card" onClick={openScanEmpty}>
            <div className="tool-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>📷</div>
            <div>
              <div className="tool-title">Escanear</div>
              <div className="tool-desc">Digitalizar con cámara</div>
            </div>
          </div>

          {/* 3. Subir Archivo (Funcional) */}
          <div className="tool-card" onClick={onPickFiles}>
            <div className="tool-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>☁️</div>
            <div>
              <div className="tool-title">Subir Archivo</div>
              <div className="tool-desc">Importar PDF o imágenes</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={onFilesChange}
              style={{ display: "none" }}
            />
          </div>

          {/* 4. Firma Digital */}
          <div className="tool-card" onClick={() => alert("✍️ Firma Digital: Seleccioná un documento para enviarlo a firmar.")}>
            <div className="tool-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>✍️</div>
            <div>
              <div className="tool-title">Firma Digital</div>
              <div className="tool-desc">Solicitar firmas remotas</div>
            </div>
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="docs-sidebar">
          <h3 className="control-section-title" style={{ marginBottom: '1rem' }}>Carpetas</h3>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span>{cat === "Todos" ? "📂" : "📁"} {cat}</span>
              <span className="category-count">
                {cat === "Todos" ? MOCK_DOCS.length : MOCK_DOCS.filter(d => d.category === cat).length}
              </span>
            </div>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div className="category-btn" onClick={() => alert("Próximamente: Bóveda Encriptada")}>
              <span>🔒 Bóveda Privada</span>
            </div>

            {/* Configuración del Escáner */}
            <div style={{ padding: '0.75rem 1rem' }}>
              <label className="toggle-switch">
                <div
                  className={`toggle-track ${useLegacyScanner ? 'checked' : ''}`}
                  onClick={() => setUseLegacyScanner(!useLegacyScanner)}
                >
                  <div className="toggle-thumb" />
                </div>
                <span>Escáner Clásico</span>
              </label>
            </div>
          </div>
        </aside>

        {/* MAIN AREA (Table only) */}
        <main className="docs-main">
          {/* LISTA DE DOCUMENTOS */}
          <section className="docs-table-container">
            <div className="docs-header">
              <h2 className="card-title">Archivos Recientes</h2>
              <input
                type="text"
                className="search-input"
                placeholder="Buscar documento o propiedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="table-scroll">
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Propiedad</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.map(doc => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{getTypeIcon(doc.type)}</span>
                          <div>
                            <div style={{ fontWeight: 500 }}>{doc.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{doc.size} • {doc.category}</div>
                          </div>
                        </div>
                      </td>
                      <td>{doc.property || "-"}</td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`status-badge ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn-mini" title="Ver">👁️</button>
                        <button className="action-btn-mini" title="Descargar">⬇️</button>
                        <button className="action-btn-mini" title="Más opciones">⋮</button>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No se encontraron documentos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>

      {/* ===== Modal del Escáner (Condicional) ===== */}
      {useLegacyScanner ? (
        <ScannerModal
          isOpen={isScanOpen}
          onClose={() => setIsScanOpen(false)}
          initialFiles={initialFiles}
        />
      ) : (
        <ScannerModalModern
          isOpen={isScanOpen}
          onClose={() => setIsScanOpen(false)}
          initialFiles={initialFiles}
        />
      )}
    </div>
  );
}
