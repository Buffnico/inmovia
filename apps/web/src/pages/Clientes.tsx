import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "AGENTE" | "RECEPCIONISTA" | "OWNER" | "ADMIN";

type TipoContacto =
  | "Amigo"
  | "Familia"
  | "Cliente comprador"
  | "Cliente vendedor"
  | "Posible cliente"
  | "Proveedor"
  | "Otro";

type EtapaContacto =
  | "Nuevo"
  | "En seguimiento"
  | "Cliente activo"
  | "Cerrado"
  | "Perdido";

interface Contact {
  id: string;
  agentId: string;
  agenteNombre?: string;
  nombre: string;
  apellido: string;
  telefonoPrincipal?: string;
  emailPrincipal?: string;
  tipoContacto: TipoContacto;
  etapa: EtapaContacto;
  origen?: string;
  fechaCumpleanios?: string; // ISO string
  recordarCumpleanios: boolean;
  fechaMudanza?: string; // ISO string
  recordarMudanza: boolean;
}

/**
 * TODO: Reemplazar esto cuando tengamos auth real.
 */
const CURRENT_USER_ROLE: UserRole = "AGENTE";

/**
 * Datos de ejemplo mientras conectamos API.
 */
const MOCK_CONTACTS: Contact[] = [
  {
    id: "c1",
    agentId: "a1",
    agenteNombre: "Agente Juan",
    nombre: "María",
    apellido: "Pérez",
    telefonoPrincipal: "+54 11 1234-5678",
    emailPrincipal: "maria.perez@example.com",
    tipoContacto: "Cliente comprador",
    etapa: "En seguimiento",
    origen: "Portal",
    fechaCumpleanios: "1990-05-12",
    recordarCumpleanios: true,
    fechaMudanza: "2024-03-01",
    recordarMudanza: true,
  },
  {
    id: "c2",
    agentId: "a1",
    agenteNombre: "Agente Juan",
    nombre: "Carlos",
    apellido: "Gómez",
    telefonoPrincipal: "+54 11 2222-3333",
    emailPrincipal: "carlos.gomez@example.com",
    tipoContacto: "Posible cliente",
    etapa: "Nuevo",
    origen: "Redes",
    recordarCumpleanios: false,
    recordarMudanza: false,
  },
  {
    id: "c3",
    agentId: "a2",
    agenteNombre: "Recepcionista Laura",
    nombre: "Laura",
    apellido: "Sosa",
    telefonoPrincipal: "+54 11 4444-5555",
    emailPrincipal: "laura.sosa@example.com",
    tipoContacto: "Proveedor",
    etapa: "Cliente activo",
    origen: "Recomendado",
    recordarCumpleanios: false,
    recordarMudanza: false,
  },
  {
    id: "c4",
    agentId: "a3",
    agenteNombre: "Agente Ana",
    nombre: "Jorge",
    apellido: "López",
    telefonoPrincipal: "+54 11 6666-7777",
    emailPrincipal: "jorge.lopez@example.com",
    tipoContacto: "Cliente vendedor",
    etapa: "Cliente activo",
    origen: "Walk-in oficina",
    recordarCumpleanios: true,
    fechaCumpleanios: "1982-11-22",
    recordarMudanza: false,
  },
  {
    id: "c5",
    agentId: "a3",
    agenteNombre: "Agente Ana",
    nombre: "Silvia",
    apellido: "Fernández",
    telefonoPrincipal: "+54 11 8888-9999",
    emailPrincipal: "silvia.fernandez@example.com",
    tipoContacto: "Amigo",
    etapa: "Cerrado",
    origen: "Recomendado",
    recordarCumpleanios: true,
    fechaCumpleanios: "1987-07-08",
    recordarMudanza: true,
    fechaMudanza: "2023-08-15",
  },
];

const TIPO_CONTACTO_OPTIONS: (TipoContacto | "Todos")[] = [
  "Todos",
  "Amigo",
  "Familia",
  "Cliente comprador",
  "Cliente vendedor",
  "Posible cliente",
  "Proveedor",
  "Otro",
];

const ETAPA_OPTIONS: (EtapaContacto | "Todas")[] = [
  "Todas",
  "Nuevo",
  "En seguimiento",
  "Cliente activo",
  "Cerrado",
  "Perdido",
];

const Clientes: React.FC = () => {
  const navigate = useNavigate();

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<TipoContacto | "Todos">("Todos");
  const [filterEtapa, setFilterEtapa] =
    useState<EtapaContacto | "Todas">("Todas");

  // Modales
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estado de contactos (mutable para la demo)
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);

  const canSeeAgentColumn = isAdminRole(CURRENT_USER_ROLE);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (filterTipo !== "Todos" && c.tipoContacto !== filterTipo) {
        return false;
      }
      if (filterEtapa !== "Todas" && c.etapa !== filterEtapa) {
        return false;
      }

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const fullName = `${c.nombre} ${c.apellido}`.toLowerCase();

      return (
        fullName.includes(term) ||
        (c.telefonoPrincipal ?? "").toLowerCase().includes(term) ||
        (c.emailPrincipal ?? "").toLowerCase().includes(term)
      );
    });
  }, [contacts, filterTipo, filterEtapa, searchTerm]);

  const handleRowClick = (contactId: string) => {
    navigate(`/contactos/${contactId}`);
  };

  const handleCreateContact = (newContact: Contact) => {
    setContacts((prev) => [newContact, ...prev]);
    setShowNewContactModal(false);
  };

  const handleImportContacts = (importedContacts: Contact[]) => {
    setContacts((prev) => [...importedContacts, ...prev]);
    setShowImportModal(false);
  };

  return (
    <div className="page-content">
      <style>{`
        /* Estilos locales para Lista de Contactos (Inmovia Style) */
        
        /* Filtros tipo cápsula */
        .card-filters {
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
          margin-bottom: 1.5rem;
        }
        .card-filters .card-header {
          display: none; /* Ocultamos el título "Filtros" para limpiar la UI */
        }
        .card-filters .card-body {
          padding: 0;
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: flex-end;
        }
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        .filter-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--inmovia-text-muted);
          margin-bottom: 0.4rem;
          margin-left: 0.5rem;
        }
        .filter-input, .filter-select {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border-radius: 999px; /* Cápsula completa */
          border: 1px solid rgba(203, 213, 225, 0.8);
          background-color: #ffffff;
          font-size: 0.95rem;
          color: var(--inmovia-text-main);
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(15, 23, 42, 0.03);
          outline: none;
        }
        .filter-input:focus, .filter-select:focus {
          border-color: var(--inmovia-primary);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
          transform: translateY(-1px);
        }

        /* Tabla estilizada */
        .card-table {
          border-radius: 1.5rem;
          overflow: hidden;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .card-table .card-header {
          background: #ffffff;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          padding: 1.25rem 1.5rem;
        }
        .contacts-table thead th {
          background: #f8fafc;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: var(--inmovia-text-muted);
          padding: 1rem 1.5rem;
          font-weight: 700;
        }
        .contacts-table tbody td {
          padding: 1rem 1.5rem;
          vertical-align: middle;
          border-bottom: 1px solid rgba(241, 245, 249, 0.8);
        }
        .contacts-row {
          transition: background-color 0.15s ease;
          cursor: pointer;
        }
        .contacts-row:hover {
          background-color: #f1f5f9;
        }
        .contacts-row:last-child td {
          border-bottom: none;
        }
        
        /* Avatar y texto */
        .contact-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .contact-name {
          font-weight: 600;
          color: var(--inmovia-text-main);
        }
        .contact-meta {
          font-size: 0.8rem;
          color: var(--inmovia-text-muted);
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .modal {
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modal-enter 0.3s ease-out;
        }
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .form-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-col {
          flex: 1;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(226, 232, 240, 0.8);
        }

        /* Estilos de Inputs del Modal (Circular / Inmovia) */
        .input, .select {
          width: 100%;
          padding: 0.75rem 1.25rem;
          border-radius: 1.5rem; /* Bordes muy redondeados */
          border: 1px solid rgba(203, 213, 225, 0.8);
          background-color: #f8fafc;
          font-size: 0.95rem;
          color: var(--inmovia-text-main);
          transition: all 0.2s ease;
          outline: none;
          box-sizing: border-box;
        }
        .input:focus, .select:focus {
          background-color: #ffffff;
          border-color: var(--inmovia-primary);
          box-shadow: 0 0 0 3px var(--inmovia-primary-soft);
        }
        .textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background-color: #f8fafc;
          font-size: 0.95rem;
          color: var(--inmovia-text-main);
          transition: all 0.2s ease;
          outline: none;
          resize: vertical;
          font-family: inherit;
          box-sizing: border-box;
        }
        .textarea:focus {
          background-color: #ffffff;
          border-color: var(--inmovia-primary);
          box-shadow: 0 0 0 3px var(--inmovia-primary-soft);
        }
        /* Ajuste para checkbox alineado */
        input[type="checkbox"] {
          width: 1.2rem;
          height: 1.2rem;
          margin: 0;
          cursor: pointer;
          accent-color: var(--inmovia-primary);
        }
      `}</style>

      {/* Header de la página */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Contactos &amp; Clientes</h1>
          <p className="page-subtitle">
            Gestioná tu agenda comercial, clientes y proveedores de la oficina.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowImportModal(true)}
          >
            Importar lista
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowNewContactModal(true)}
          >
            + Nuevo contacto
          </button>
        </div>
      </div>

      {/* Filtros rediseñados */}
      <div className="card card-filters">
        <div className="card-body">
          <div className="filter-group" style={{ flex: 2 }}>
            <label className="filter-label">Buscar</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Tipo</label>
            <select
              className="filter-select"
              value={filterTipo}
              onChange={(e) =>
                setFilterTipo(e.target.value as TipoContacto | "Todos")
              }
            >
              {TIPO_CONTACTO_OPTIONS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Etapa</label>
            <select
              className="filter-select"
              value={filterEtapa}
              onChange={(e) =>
                setFilterEtapa(e.target.value as EtapaContacto | "Todas")
              }
            >
              {ETAPA_OPTIONS.map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Card de tabla de contactos */}
      <div className="card card-table">
        <div className="card-header card-header-compact">
          <h2 className="card-title">
            Lista de contactos <span style={{ opacity: 0.5, fontSize: '0.9em', marginLeft: '0.5rem' }}>{filteredContacts.length}</span>
          </h2>
        </div>

        <div className="card-body" style={{ padding: 0 }}>
          {filteredContacts.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--inmovia-text-muted)' }}>
              <p>No se encontraron contactos con los filtros actuales.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table contacts-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Tipo</th>
                    <th>Etapa</th>
                    {canSeeAgentColumn && <th>Agente</th>}
                    <th>Recordatorios</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="contacts-row"
                      onClick={() => handleRowClick(contact.id)}
                    >
                      <td>
                        <div className="contact-cell">
                          <div className="avatar avatar-sm">
                            {getInitials(contact.nombre, contact.apellido)}
                          </div>
                          <div className="contact-cell-text">
                            <div className="contact-name">
                              {contact.nombre} {contact.apellido}
                            </div>
                            {contact.origen && (
                              <div className="contact-meta">
                                {contact.origen}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{contact.telefonoPrincipal ?? "-"}</td>
                      <td>{contact.emailPrincipal ?? "-"}</td>
                      <td>
                        <span className="chip chip-soft" style={{ fontSize: '0.8rem' }}>
                          {contact.tipoContacto}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`chip chip-etapa-${toSlug(contact.etapa)}`}
                          style={{ fontSize: '0.8rem' }}
                        >
                          {contact.etapa}
                        </span>
                      </td>
                      {canSeeAgentColumn && (
                        <td>{contact.agenteNombre ?? "-"}</td>
                      )}
                      <td>
                        <div className="badge-reminders" style={{ display: 'flex', gap: '0.25rem' }}>
                          {contact.recordarCumpleanios && (
                            <span title="Cumpleaños" style={{ fontSize: '1.1rem' }}>🎂</span>
                          )}
                          {contact.recordarMudanza && (
                            <span title="Mudanza" style={{ fontSize: '1.1rem' }}>🚚</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Nuevo contacto */}
      {showNewContactModal && (
        <NewContactModal
          onClose={() => setShowNewContactModal(false)}
          onSave={handleCreateContact}
        />
      )}

      {/* Modal: Importar contactos */}
      {showImportModal && (
        <ImportContactsModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportContacts}
        />
      )}
    </div>
  );
};

// --- Subcomponentes de Modal (Inline para mantener todo en un archivo por ahora) ---

interface NewContactModalProps {
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

const NewContactModal: React.FC<NewContactModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Contact>>({
    nombre: "",
    apellido: "",
    telefonoPrincipal: "",
    emailPrincipal: "",
    tipoContacto: "Posible cliente",
    etapa: "Nuevo",
    origen: "",
    recordarCumpleanios: false,
    recordarMudanza: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido) {
      alert("Nombre y Apellido son obligatorios");
      return;
    }

    const newContact: Contact = {
      id: `c${Date.now()}`,
      agentId: "current", // Mock
      agenteNombre: "Yo",
      nombre: formData.nombre!,
      apellido: formData.apellido!,
      telefonoPrincipal: formData.telefonoPrincipal,
      emailPrincipal: formData.emailPrincipal,
      tipoContacto: formData.tipoContacto as TipoContacto,
      etapa: formData.etapa as EtapaContacto,
      origen: formData.origen,
      recordarCumpleanios: formData.recordarCumpleanios!,
      fechaCumpleanios: formData.fechaCumpleanios,
      recordarMudanza: formData.recordarMudanza!,
      fechaMudanza: formData.fechaMudanza,
    };

    onSave(newContact);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <h2 className="card-title">Nuevo Contacto</h2>
        </div>
        <form onSubmit={handleSubmit} className="card-body">
          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Apellido *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Teléfono</label>
              <input
                type="tel"
                className="input"
                value={formData.telefonoPrincipal}
                onChange={(e) => setFormData({ ...formData, telefonoPrincipal: e.target.value })}
              />
            </div>
            <div className="form-col">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.emailPrincipal}
                onChange={(e) => setFormData({ ...formData, emailPrincipal: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label className="form-label">Tipo</label>
              <select
                className="select"
                value={formData.tipoContacto}
                onChange={(e) => setFormData({ ...formData, tipoContacto: e.target.value as TipoContacto })}
              >
                {TIPO_CONTACTO_OPTIONS.filter(o => o !== "Todos").map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="form-col">
              <label className="form-label">Etapa</label>
              <select
                className="select"
                value={formData.etapa}
                onChange={(e) => setFormData({ ...formData, etapa: e.target.value as EtapaContacto })}
              >
                {ETAPA_OPTIONS.filter(o => o !== "Todas").map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Origen</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Portal, Referido, Redes..."
              value={formData.origen}
              onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            />
          </div>

          <div className="form-row" style={{ marginTop: '1.5rem' }}>
            <div className="form-col">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.recordarCumpleanios}
                  onChange={(e) => setFormData({ ...formData, recordarCumpleanios: e.target.checked })}
                />
                Recordar Cumpleaños
              </label>
              {formData.recordarCumpleanios && (
                <input
                  type="date"
                  className="input mt-1"
                  value={formData.fechaCumpleanios || ""}
                  onChange={(e) => setFormData({ ...formData, fechaCumpleanios: e.target.value })}
                />
              )}
            </div>
            <div className="form-col">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={formData.recordarMudanza}
                  onChange={(e) => setFormData({ ...formData, recordarMudanza: e.target.checked })}
                />
                Recordar Mudanza
              </label>
              {formData.recordarMudanza && (
                <input
                  type="date"
                  className="input mt-1"
                  value={formData.fechaMudanza || ""}
                  onChange={(e) => setFormData({ ...formData, fechaMudanza: e.target.value })}
                />
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar Contacto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ImportContactsModalProps {
  onClose: () => void;
  onImport: (contacts: Contact[]) => void;
}

const ImportContactsModal: React.FC<ImportContactsModalProps> = ({ onClose, onImport }) => {
  const [text, setText] = useState("");

  const handleProcess = () => {
    // Parser simple de CSV: Nombre,Apellido,Telefono,Email
    const lines = text.split("\n").filter(l => l.trim());
    const newContacts: Contact[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(",");
      if (parts.length >= 2) {
        newContacts.push({
          id: `imp-${Date.now()}-${idx}`,
          agentId: "current",
          nombre: parts[0].trim(),
          apellido: parts[1].trim(),
          telefonoPrincipal: parts[2]?.trim() || "",
          emailPrincipal: parts[3]?.trim() || "",
          tipoContacto: "Posible cliente",
          etapa: "Nuevo",
          origen: "Importado",
          recordarCumpleanios: false,
          recordarMudanza: false,
        });
      }
    });

    if (newContacts.length === 0) {
      alert("No se pudieron procesar contactos. Usá el formato: Nombre,Apellido,Telefono,Email");
      return;
    }

    onImport(newContacts);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <h2 className="card-title">Importar Contactos</h2>
        </div>
        <div className="card-body">
          <p className="text-muted mb-2">
            Pegá tu lista de contactos en formato CSV simple (una línea por contacto):
          </p>
          <div className="alert alert-info" style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            <strong>Formato:</strong> Nombre, Apellido, Teléfono, Email
          </div>
          <textarea
            className="textarea"
            rows={10}
            placeholder={"Juan, Perez, 11223344, juan@test.com\nMaria, Gomez, 55667788, maria@test.com"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={handleProcess}>
            Procesar e Importar
          </button>
        </div>
      </div>
    </div>
  );
};

function isAdminRole(role: UserRole): boolean {
  return role === "OWNER" || role === "ADMIN";
}

function getInitials(nombre: string, apellido: string): string {
  const n = nombre?.trim()[0] ?? "";
  const a = apellido?.trim()[0] ?? "";
  return (n + a).toUpperCase();
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

export default Clientes;
