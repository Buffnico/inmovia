import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ScannerModal from "../scanner/components/ScannerModal";
import OfficeModelFormModal from "../components/OfficeModelFormModal";
import UseOfficeModelWizard from "../components/UseOfficeModelWizard";
import DocumentPreviewModal from "../components/DocumentPreviewModal";
import UploadDocumentModal from "../components/UploadDocumentModal";
import SignatureUploadModal from "../components/SignatureUploadModal";
import ConfirmDialog from "../components/ConfirmDialog";
import SelectOfficeModelModal from "../components/SelectOfficeModelModal";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

// --- Types ---

type DocStatus = "firmado" | "pendiente" | "borrador" | "revision";
type DocType = "pdf" | "docx" | "jpg" | "jpeg" | "png" | "folder";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  date: string;
  size: string;
  status: DocStatus;
  property?: string;
  filePath?: string;
  title?: string;
  originalName?: string;
  updatedAt?: string;
  createdAt?: string;
  agentUserId?: string | null;
  ownerUserId?: string;
  signature?: {
    enabled: boolean;
    status: "SOLICITADO" | "PENDIENTE" | "FIRMADO" | null;
    signedAt?: string | null;
    requestedBy?: string | null;
    approvedBy?: string | null;
  };
}

const CATEGORIES = ["Todos", "Contratos", "Identidad", "Legal", "Planos", "Borradores", "Oficina modelos"];
const SIGNATURE_VIEW = "Documentos a firmar";

// --- Componente Principal ---

export default function Documentos() {
  // Estado del escáner
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [initialFiles, setInitialFiles] = useState<File[]>([]);

  // Estado de la UI
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para Modal de Subida
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Estado para subida desde Escáner
  const [scanGeneratedFile, setScanGeneratedFile] = useState<File | null>(null);
  const [isUploadFromScanOpen, setIsUploadFromScanOpen] = useState(false);

  // Estado para Modal de Firma
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // --- Documents State ---
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // --- Office Models State ---
  const { user } = useAuth();
  const navigate = useNavigate();
  const [officeModels, setOfficeModels] = useState<any[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [isModelFormOpen, setIsModelFormOpen] = useState(false);
  const [modelToEdit, setModelToEdit] = useState<any>(null);

  const [showSelectModelModal, setShowSelectModelModal] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<any>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ id?: string, previewUrl?: string, title?: string, isModel?: boolean } | null>(null);

  // --- Delete Confirmation State ---
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "document" | "officeModel";
    id: string;
    name: string;
  } | null>(null);

  // Fetch data
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchModels();
    }
  }, [location.key, user]);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Ensure data.data is an array
        setDocuments(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Error fetching documents:", res.status);
      }
    } catch (e) {
      console.error("Error fetching documents:", e);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/documents/office-models`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOfficeModels(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Error fetching models:", res.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModels(false);
    }
  };

  const canManageModels = user && ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'].includes(user.role?.toUpperCase());
  const canSendToSignature = user && ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'].includes(user.role?.toUpperCase());

  const handleApproveSignature = async (docId: string) => {
    if (!confirm("¿Aprobar envío a firma de este documento?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/documents/${docId}/approve-signature`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDocuments();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const handleConfirmDelete = async () => {
    // 1. Verify we have a target and an ID
    if (!deleteTarget || !deleteTarget.id) {
      console.error("Intento de eliminar sin ID válido:", deleteTarget);
      setDeleteTarget(null);
      return;
    }

    console.log(`🗑️ Deleting ${deleteTarget.type}: ${deleteTarget.id}`);

    const token = localStorage.getItem('token');

    // 2. Construct URL using the ID consistently
    const endpoint = deleteTarget.type === "officeModel"
      ? `${API_BASE_URL}/documents/office-models/${deleteTarget.id}`
      : `${API_BASE_URL}/documents/${deleteTarget.id}`;

    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      // 3. Handle success (including "alreadyRemoved" case)
      if (res.ok || data.success) {
        console.log("✅ Delete success. Refreshing list...");

        if (deleteTarget.type === "officeModel") {
          await fetchModels();
        } else {
          await fetchDocuments();
        }
        setDeleteTarget(null);
      } else {
        console.error("❌ Error deleting:", data);
        if (res.status === 401 || res.status === 403) {
          alert("Tu sesión ha expirado. Por favor, volvé a iniciar sesión.");
        } else {
          alert("Error al eliminar: " + (data.message || "Desconocido"));
        }
      }
    } catch (e) {
      console.error("❌ Network error deleting:", e);
      alert("Error de conexión al eliminar");
    }
  };

  const handleMarkAsSigned = async (docId: string) => {
    if (!confirm("¿Confirmás que este documento ha sido firmado manualmente?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/documents/${docId}/mark-signed`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchDocuments();
      } else {
        alert("Error al marcar como firmado");
      }
    } catch (error) {
      console.error("Error marking as signed:", error);
      alert("Error de conexión");
    }
  };

  // --- Funciones del Escáner ---
  function openScanEmpty() {
    setInitialFiles([]);
    setIsScanOpen(true);
  }

  // --- Filtrado ---
  // --- Filtrado ---
  const filteredDocs = documents.filter(doc => {
    if (activeCategory === SIGNATURE_VIEW) {
      if (!doc.signature?.enabled) return false;

      // If owner/admin, show all. If agent, show only assigned or owned.
      if (canSendToSignature) return true;

      return (doc.agentUserId === user?.id) || (doc.ownerUserId === user?.id);
    }

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

  const getSignatureStatusBadge = (status: string | null) => {
    if (status === 'FIRMADO') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'PENDIENTE') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'SOLICITADO') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-600';
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("doc")) return "📝";
    if (type.includes("jpg") || type.includes("png")) return "🖼️";
    return "📄";
  };

  const getCategoryCount = (cat: string) => {
    if (cat === "Oficina modelos") return officeModels.length;
    if (cat === SIGNATURE_VIEW) return documents.filter(d => d.signature?.enabled).length;
    if (cat === "Todos") return documents.length;
    return documents.filter(d => d.category === cat).length;
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
          {/* 1. Nuevo Documento */}
          <div className="tool-card" onClick={() => setShowSelectModelModal(true)}>
            <div className="tool-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>📄</div>
            <div>
              <div className="tool-title">Nuevo Documento</div>
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
          <div className="tool-card" onClick={() => setIsUploadModalOpen(true)}>
            <div className="tool-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>☁️</div>
            <div>
              <div className="tool-title">Subir Archivo</div>
              <div className="tool-desc">Importar PDF o imágenes</div>
            </div>
          </div>

          {/* 4. Firma Digital */}
          <div className="tool-card" onClick={() => setIsSignatureModalOpen(true)}>
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
                {getCategoryCount(cat)}
              </span>
            </div>
          ))}

          <div style={{ height: '1px', background: '#e2e8f0', margin: '1rem 0' }}></div>

          <div
            className={`category-btn ${activeCategory === SIGNATURE_VIEW ? 'active' : ''}`}
            onClick={() => setActiveCategory(SIGNATURE_VIEW)}
          >
            <span>✍️ {SIGNATURE_VIEW}</span>
            <span className="category-count">
              {getCategoryCount(SIGNATURE_VIEW)}
            </span>
          </div>
        </aside>

        {/* MAIN AREA (Table only) */}
        <main className="docs-main">
          {/* LISTA DE DOCUMENTOS */}
          <section className="docs-table-container">
            <div className="docs-header">
              <h2 className="card-title">
                {activeCategory === "Oficina modelos" ? "Modelos de Oficina" :
                  activeCategory === SIGNATURE_VIEW ? "Documentos a firmar" : "Archivos Recientes"}
              </h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {activeCategory === "Oficina modelos" && canManageModels && (
                  <button className="btn btn-primary btn-sm" onClick={() => { setModelToEdit(null); setIsModelFormOpen(true); }}>
                    + Nuevo Modelo
                  </button>
                )}
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="table-scroll">
              {activeCategory === "Oficina modelos" ? (
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripción</th>
                      <th>Última Modificación</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officeModels.map(model => (
                      <tr key={model.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>📝</span>
                            <div style={{ fontWeight: 500 }}>{model.name}</div>
                          </div>
                        </td>
                        <td>{model.description || "-"}</td>
                        <td>{model.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : new Date(model.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="action-btn-mini" title="Vista Previa" onClick={() => { setPreviewDoc({ id: model.id, title: model.name, isModel: true, previewUrl: `${API_BASE_URL}/documents/office-models/${model.id}/preview` }); setIsPreviewOpen(true); }}>👁️</button>

                          <button className="action-btn-mini" title="Usar Modelo" onClick={() => { setSelectedModel(model); setIsWizardOpen(true); }}>⚙️</button>

                          <button className="action-btn-mini" title="Usar con Cláusulas (Ivo-t)" onClick={() => navigate(`/ivot?mode=documentModel&modelId=${model.id}`)}>🤖</button>

                          {canManageModels && (
                            <>
                              <button className="action-btn-mini" title="Editar" onClick={() => { setModelToEdit(model); setIsModelFormOpen(true); }}>✏️</button>
                              <button className="action-btn-mini" title="Eliminar" onClick={() => setDeleteTarget({ type: "officeModel", id: model.id, name: model.name })}>🗑️</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {officeModels.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay modelos disponibles.</td></tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="docs-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Propiedad</th>
                      <th>Última Act.</th>
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
                        <td>
                          {doc.updatedAt
                            ? new Date(doc.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : doc.date}
                        </td>
                        <td>
                          {doc.signature?.enabled ? (
                            <span className={`status-badge ${getSignatureStatusBadge(doc.signature.status)}`}>
                              {doc.signature.status === 'FIRMADO' ? 'Firmado' :
                                doc.signature.status === 'PENDIENTE' ? 'Pendiente' :
                                  doc.signature.status === 'SOLICITADO' ? 'Solicitado' : '-'}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>
                        <td>
                          <button className="action-btn-mini" title="Ver" onClick={() => { setPreviewDoc({ id: doc.id, title: doc.name, previewUrl: `${API_BASE_URL}/documents/${doc.id}/preview` }); setIsPreviewOpen(true); }}>👁️</button>

                          {/* Download button for signature docs */}
                          {activeCategory === SIGNATURE_VIEW && (
                            <a href={`${API_BASE_URL}/documents/${doc.id}/preview`} download={doc.name} className="action-btn-mini" title="Descargar" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-block' }}>⬇️</a>
                          )}

                          {activeCategory === SIGNATURE_VIEW && canSendToSignature && (
                            <>
                              {doc.signature?.status === 'SOLICITADO' && (
                                <button className="action-btn-mini" title="Aprobar y Enviar" onClick={() => handleApproveSignature(doc.id)}>👍</button>
                              )}
                              {doc.signature?.status === 'PENDIENTE' && (
                                <button className="action-btn-mini" title="Marcar como Firmado" onClick={() => handleMarkAsSigned(doc.id)}>✅</button>
                              )}
                            </>
                          )}

                          <button className="action-btn-mini" title="Eliminar" onClick={() => setDeleteTarget({ type: "document", id: doc.id, name: doc.name })}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                    {filteredDocs.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          {loadingDocs ? "Cargando documentos..." : "No se encontraron documentos."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>

        </main>
      </div>

      {/* ===== Modal del Escáner ===== */}
      <ScannerModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        initialFiles={initialFiles}
        onSaveToDocuments={(file) => {
          setScanGeneratedFile(file);
          setIsUploadFromScanOpen(true);
          // Opcional: cerrar escáner o dejarlo abierto. 
          // Si queremos cerrarlo: setIsScanOpen(false);
        }}
      />

      {/* Modals for Office Models */}
      <OfficeModelFormModal
        isOpen={isModelFormOpen}
        onClose={() => setIsModelFormOpen(false)}
        onSuccess={fetchModels}
        modelToEdit={modelToEdit}
      />

      <UseOfficeModelWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        model={selectedModel}
      />

      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewUrl={previewDoc?.previewUrl || ""}
        fileName={previewDoc?.title}
      />

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploaded={fetchDocuments}
      />

      {/* Modal de subida específico para el Escáner */}
      {isUploadFromScanOpen && scanGeneratedFile && (
        <UploadDocumentModal
          isOpen={true}
          onClose={() => {
            setIsUploadFromScanOpen(false);
            setScanGeneratedFile(null);
          }}
          onUploaded={() => {
            fetchDocuments();
            setIsUploadFromScanOpen(false);
            setScanGeneratedFile(null);
            // También cerramos el escáner al terminar con éxito
            setIsScanOpen(false);
          }}
          initialFile={scanGeneratedFile}
          initialTitle={scanGeneratedFile.name.replace('.pdf', '')}
        />
      )}

      <SignatureUploadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onUploaded={fetchDocuments}
        canSendToSignature={!!canSendToSignature}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Eliminar documento"
        message={`¿Querés eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <SelectOfficeModelModal
        isOpen={showSelectModelModal}
        officeModels={officeModels}
        onClose={() => setShowSelectModelModal(false)}
        onSelect={(model) => {
          setShowSelectModelModal(false);
          setSelectedModel(model);
          setIsWizardOpen(true);
        }}
      />

    </div>
  );
}
