import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import "./Clientes.css";

type UserRole = "AGENTE" | "RECEPCIONISTA" | "OWNER" | "ADMIN" | "MARTILLERO";

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
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<TipoContacto | "Todos">("Todos");
  const [filterEtapa, setFilterEtapa] =
    useState<EtapaContacto | "Todas">("Todas");

  // Modales
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estado de contactos
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/contacts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) setContacts(data.data);
      })
      .catch(err => console.error("Error fetching contacts", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const canSeeAgentColumn = user && ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'].includes(user.role);

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
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newContact)
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setContacts((prev) => [data.data, ...prev]);
          setShowNewContactModal(false);
        }
      });
  };

  const handleImportContacts = (importedContacts: Contact[]) => {
    // Implement import logic via API if needed, or loop create
    // For now just local update to mock
    setContacts((prev) => [...importedContacts, ...prev]);
    setShowImportModal(false);
  };

  return (
    <div className="page-content">
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
            Lista de contactos <span className="text-muted" style={{ fontSize: '0.9em', marginLeft: '0.5rem' }}>{filteredContacts.length}</span>
          </h2>
        </div>

        <div className="card-body p-0">
          {filteredContacts.length === 0 ? (
            <div className="p-5 text-center text-muted">
              <p>No se encontraron contactos con los filtros actuales.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table contacts-table w-100">
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
                        <span className="chip chip-soft text-xs">
                          {contact.tipoContacto}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`chip chip-etapa-${toSlug(contact.etapa)} text-xs`}
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
