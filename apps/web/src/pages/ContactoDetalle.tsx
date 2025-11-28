import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./Clientes.css";

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

type ActivityType =
  | "NOTA"
  | "LLAMADA"
  | "EMAIL"
  | "TAREA"
  | "EVENTO"
  | "VISITA";

interface Contact {
  id: string;
  agentId: string;
  ownerId?: string;
  agenteNombre?: string;
  nombre: string;
  apellido: string;
  telefonoPrincipal?: string;
  emailPrincipal?: string;
  tipoContacto: TipoContacto;
  etapa: EtapaContacto;
  origen?: string;
  fechaCumpleanios?: string; // ISO YYYY-MM-DD
  recordarCumpleanios: boolean;
  fechaMudanza?: string; // ISO YYYY-MM-DD
  recordarMudanza: boolean;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  feedbackReminder?: {
    enabled: boolean;
    frequencyDays: number;
    occurrences: number;
    note: string;
    startDate: string;
  };
  contactType?: string;
  status?: string;
  source?: string;
  sourceDetail?: string;
}

interface ContactActivity {
  id: string;
  contactId: string;
  tipo: ActivityType;
  fechaHora: string; // ISO
  titulo: string;
  descripcion?: string;
  propiedadRelacionada?: string;
  origenAgenda?: boolean;
}

interface ContactFile {
  id: string;
  contactId: string;
  nombre: string;
  tipo: string; // DNI, Reserva, Contrato, etc.
  fechaSubida: string; // ISO
}

// Mocks para actividades y archivos (por ahora siguen mockeados en front o se podrían mover a backend)
const MOCK_ACTIVITIES: ContactActivity[] = [
  {
    id: "a1",
    contactId: "c1",
    tipo: "LLAMADA",
    fechaHora: "2025-11-15T10:30:00",
    titulo: "Llamada de seguimiento",
    descripcion: "Consultó por avance de reserva de PH en Banfield.",
    propiedadRelacionada: "PH Banfield - Rodríguez Peña 450",
  },
  {
    id: "a2",
    contactId: "c1",
    tipo: "EVENTO",
    fechaHora: "2025-11-10T15:00:00",
    titulo: "Visita a propiedad",
    descripcion: "Visita agendada desde Agenda & recordatorios.",
    propiedadRelacionada: "Depto 3 amb. Lomas Centro",
    origenAgenda: true,
  },
];

const MOCK_FILES: ContactFile[] = [
  {
    id: "f1",
    contactId: "c1",
    nombre: "DNI_MariaPerez.pdf",
    tipo: "DNI",
    fechaSubida: "2025-10-20",
  },
];

const INFO_FIELDS = [
  {
    id: "necesidades",
    title: "Necesidades",
    question: "¿Cuáles son sus deseos, anhelos y necesidades?",
    placeholder:
      "Por ejemplo, comprar una casa nueva, vender su propiedad actual, invertir a largo plazo…",
  },
  {
    id: "urgencia",
    title: "Urgencia",
    question: "¿Cuál es su cronograma?",
    placeholder:
      "Por ejemplo, inmediatamente, en los próximos 6 meses, antes de que empiecen las clases…",
  },
];

import { useAuth } from "../store/auth";
import { Propiedad } from "./Propiedades";

const ContactoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

  const [contact, setContact] = useState<Contact | null>(null);
  const [properties, setProperties] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<"actividades" | "info" | "archivos" | "propiedades" | "historial">("actividades");

  // CRM Fields State
  const [contactType, setContactType] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");

  // History State
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);

  // Estados locales para edición
  const [fechaCumple, setFechaCumple] = useState("");
  const [recordarCumple, setRecordarCumple] = useState(false);
  const [fechaMudanza, setFechaMudanza] = useState("");
  const [recordarMudanza, setRecordarMudanza] = useState(false);

  // Feedback Reminder State
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [feedbackFreq, setFeedbackFreq] = useState(7);
  const [feedbackOccurrences, setFeedbackOccurrences] = useState(3);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackStartDate, setFeedbackStartDate] = useState("");
  const [isCustomFreq, setIsCustomFreq] = useState(false);

  const [futureEvents, setFutureEvents] = useState<any[]>([]);

  // Cargar contacto y propiedades
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const token = localStorage.getItem('token');

    Promise.all([
      fetch(`${API_BASE_URL}/contacts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/contacts/${id}/properties`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/contacts/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/contacts/${id}/properties`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/agenda?contactId=${id}&futureOnly=true`, { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch(`${API_BASE_URL}/agenda?contactId=${id}`, { headers: { 'Authorization': `Bearer ${token}` } }) // History (all events)
    ])
      .then(async ([resContact, resProps, resFuture, resHistory]) => {
        if (!resContact.ok) throw new Error("Error cargando contacto");

        const dataContact = await resContact.json();
        if (dataContact.ok && dataContact.data) {
          const c = dataContact.data;
          setContact(c);
          // Inicializar estados locales
          setFechaCumple(c.fechaCumpleanios || "");
          setRecordarCumple(c.recordarCumpleanios || false);
          setFechaMudanza(c.fechaMudanza || "");
          setRecordarMudanza(c.recordarMudanza || false);

          if (c.feedbackReminder) {
            setFeedbackEnabled(c.feedbackReminder.enabled);
            setFeedbackFreq(c.feedbackReminder.frequencyDays);
            setFeedbackOccurrences(c.feedbackReminder.occurrences);
            setFeedbackNote(c.feedbackReminder.note);
            setFeedbackStartDate(c.feedbackReminder.startDate);
            setIsCustomFreq(![7, 15, 30].includes(c.feedbackReminder.frequencyDays));
          } else {
            setFeedbackStartDate(new Date().toISOString().split('T')[0]);
          }

          // Initialize CRM fields
          setContactType(c.contactType || "posible_comprador");
          setStatus(c.status || "nuevo_lead");
          setSource(c.source || "otro");
          setSourceDetail(c.sourceDetail || "");
        } else {
          setError("Contacto no encontrado");
        }

        if (resProps.ok) {
          const dataProps = await resProps.json();
          if (dataProps.ok) {
            setProperties(dataProps.data);
          }
        }

        if (resFuture.ok) {
          const dataFuture = await resFuture.json();
          if (dataFuture.ok) setFutureEvents(dataFuture.data);
        }

        if (resHistory.ok) {
          const dataHistory = await resHistory.json();
          if (dataHistory.ok) {
            // Sort by date desc
            const sorted = dataHistory.data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistoryEvents(sorted);
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, API_BASE_URL]);

  const handleSave = async () => {
    if (!contact) return;
    setSaving(true);
    try {
      const updatedData = {
        ...contact,
        fechaCumpleanios: fechaCumple,
        recordarCumpleanios: recordarCumple,
        fechaMudanza: fechaMudanza,
        recordarMudanza: recordarMudanza,
        feedbackReminder: {
          enabled: feedbackEnabled,
          frequencyDays: feedbackFreq,
          occurrences: feedbackOccurrences,
          note: feedbackNote,
          startDate: feedbackStartDate
        },
        contactType,
        status,
        source,
        sourceDetail
      };

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/contacts/${contact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (data.ok) {
        setContact(data.data);
        alert("Contacto guardado correctamente (y recordatorios actualizados).");
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

  const canEdit = user && contact && (
    ['OWNER', 'ADMIN', 'MARTILLERO'].includes(user.role) ||
    (user.role === 'AGENTE' && (contact.ownerId === user.id || contact.agentId === user.id))
  );

  if (loading) return <div className="page-content">Cargando...</div>;
  if (error || !contact) {
    return (
      <div className="page-content">
        <div className="card contact-detail-top-card">
          <button type="button" className="btn-icon-back" onClick={() => navigate("/contactos")}>←</button>
          <h1 className="contact-top-title">{error || "Contacto no encontrado"}</h1>
        </div>
      </div>
    );
  }

  const activities = MOCK_ACTIVITIES.filter((a) => a.contactId === contact.id);
  const files = MOCK_FILES.filter((f) => f.contactId === contact.id);

  return (
    <div className="page-content">
      <div className="card contact-detail-top-card">
        <button type="button" className="btn-icon-back" onClick={() => navigate("/contactos")}>←</button>
        <h1 className="contact-top-title">Información de contacto</h1>
        <div style={{ marginLeft: 'auto' }}>
          {canEdit && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      </div>

      <div className="contact-detail-layout">
        <div className="card contact-detail-sidebar">
          <div className="contact-detail-sidebar-header">
            <div className="avatar avatar-lg">{getInitials(contact.nombre, contact.apellido)}</div>
            <div className="contact-detail-sidebar-title">
              <div className="contact-detail-name">{contact.nombre} {contact.apellido}</div>
              <div className="contact-detail-tags">
                <span className="chip chip-soft">{contact.tipoContacto}</span>
                <span className={`chip chip-etapa-${toSlug(contact.etapa)} chip-soft-strong`}>{contact.etapa}</span>
              </div>
            </div>
          </div>

          <div className="contact-quick-actions">
            <button type="button" className="btn-quick">📝 Nota</button>
            <button type="button" className="btn-quick">📞 Llamada</button>
            <button type="button" className="btn-quick">✉️ Correo</button>
            <button type="button" className="btn-quick">✅ Tarea</button>
          </div>

          <div className="contact-section">
            <h3 className="contact-section-title">Datos CRM</h3>
            <div className="form-group mb-2">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Tipo</label>
              <select className="form-select form-select-sm" value={contactType} onChange={e => setContactType(e.target.value)}>
                <option value="posible_comprador">Posible Comprador</option>
                <option value="posible_vendedor">Posible Vendedor</option>
                <option value="cliente_activo">Cliente Activo</option>
                <option value="propietario">Propietario</option>
                <option value="inquilino">Inquilino</option>
                <option value="referido">Referido</option>
                <option value="amigo_familia">Amigo / Familia</option>
              </select>
            </div>
            <div className="form-group mb-2">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Estado</label>
              <select className="form-select form-select-sm" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="nuevo_lead">Nuevo Lead</option>
                <option value="en_seguimiento">En Seguimiento</option>
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div className="form-group mb-2">
              <label className="form-label" style={{ fontSize: '0.85rem' }}>Origen</label>
              <select className="form-select form-select-sm" value={source} onChange={e => setSource(e.target.value)}>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="zonaprop">Zonaprop</option>
                <option value="cartel">Cartel</option>
                <option value="referido">Referido</option>
                <option value="oficina">Oficina</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            {source === 'otro' && (
              <div className="form-group">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Detalle origen..."
                  value={sourceDetail}
                  onChange={e => setSourceDetail(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="contact-section">
            <h3 className="contact-section-title">Información de contacto</h3>
            <dl className="contact-info-list">
              <div className="contact-info-row"><dt>Teléfono</dt><dd>{contact.telefonoPrincipal ?? "—"}</dd></div>
              <div className="contact-info-row"><dt>Email</dt><dd>{contact.emailPrincipal ?? "—"}</dd></div>
              <div className="contact-info-row"><dt>Dirección</dt><dd>{contact.direccion ? `${contact.direccion}${contact.ciudad ? ` – ${contact.ciudad}` : ""}` : "—"}</dd></div>
            </dl>
          </div>

          {/* Recordatorios Editables */}
          <div className="contact-section">
            <h3 className="contact-section-title">Recordatorios</h3>

            {/* Cumpleaños */}
            <div className="contact-reminder-row">
              <div style={{ marginBottom: '0.5rem' }}>
                <div className="contact-reminder-label">Cumpleaños</div>
                <input
                  type="date"
                  className="input-date-rounded"
                  value={fechaCumple}
                  onChange={(e) => setFechaCumple(e.target.value)}
                />
              </div>
              <div className="contact-reminder-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={recordarCumple}
                  onClick={() => setRecordarCumple(!recordarCumple)}
                  className="toggle-switch"
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="toggle-label">{recordarCumple ? "Recordar" : "No recordar"}</span>
              </div>
            </div>

            {/* Mudanza */}
            <div className="contact-reminder-row">
              <div style={{ marginBottom: '0.5rem' }}>
                <div className="contact-reminder-label">Aniversario de mudanza</div>
                <input
                  type="date"
                  className="input-date-rounded"
                  value={fechaMudanza}
                  onChange={(e) => setFechaMudanza(e.target.value)}
                />
              </div>
              <div className="contact-reminder-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={recordarMudanza}
                  onClick={() => setRecordarMudanza(!recordarMudanza)}
                  className="toggle-switch"
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="toggle-label">{recordarMudanza ? "Recordar" : "No recordar"}</span>
              </div>
            </div>
          </div>

          {/* Recordar Feedback */}
          <div className="contact-section">
            <div className="contact-reminder-row">
              <div style={{ marginBottom: '0.5rem' }}>
                <div className="contact-reminder-label">Recordar Feedback</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Generar eventos recurrentes</div>
              </div>
              <div className="contact-reminder-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={feedbackEnabled}
                  onClick={() => setFeedbackEnabled(!feedbackEnabled)}
                  className="toggle-switch"
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="toggle-label">{feedbackEnabled ? "Activado" : "Desactivado"}</span>
              </div>
            </div>

            {feedbackEnabled && (
              <div className="feedback-config" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-root)', borderRadius: '8px' }}>
                <div className="form-group mb-2">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Frecuencia</label>
                  <select
                    className="form-select form-select-sm"
                    value={isCustomFreq ? "custom" : feedbackFreq}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomFreq(true);
                      } else {
                        setIsCustomFreq(false);
                        setFeedbackFreq(Number(e.target.value));
                      }
                    }}
                  >
                    <option value={7}>Cada 7 días</option>
                    <option value={15}>Cada 15 días</option>
                    <option value={30}>Cada 30 días</option>
                    <option value="custom">Personalizado</option>
                  </select>
                  {isCustomFreq && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={feedbackFreq}
                        onChange={(e) => setFeedbackFreq(Number(e.target.value))}
                        style={{ width: '80px' }}
                      />
                      <span style={{ fontSize: '0.85rem' }}>días</span>
                    </div>
                  )}
                </div>

                <div className="grid-2 mb-2">
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Repeticiones</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={feedbackOccurrences}
                      onChange={(e) => setFeedbackOccurrences(Number(e.target.value))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Inicio</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={feedbackStartDate}
                      onChange={(e) => setFeedbackStartDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '0.85rem' }}>Nota para el evento</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Ej: Seguimiento comprador..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Próximos Recordatorios */}
          {futureEvents.length > 0 && (
            <div className="contact-section">
              <h3 className="contact-section-title">Próximos recordatorios</h3>
              <div className="future-events-list">
                {futureEvents.map(e => (
                  <div key={e.id} className="future-event-item" style={{
                    display: 'flex',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--border-color)',
                    alignItems: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem' }}>
                      {e.type === 'CUMPLE' ? '🎂' : e.type === 'MUDANZA' ? '📦' : '📅'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{e.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{formatDate(e.date)}</div>
                    </div>
                    <Link to={`/agenda`} className="btn btn-xs btn-ghost">Ver</Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card contact-detail-main">
          <div className="contact-tabs">
            <button type="button" className={"contact-tab" + (activeTab === "actividades" ? " contact-tab-active" : "")} onClick={() => setActiveTab("actividades")}>Actividades</button>
            <button type="button" className={"contact-tab" + (activeTab === "info" ? " contact-tab-active" : "")} onClick={() => setActiveTab("info")}>Información personal</button>
            <button type="button" className={"contact-tab" + (activeTab === "historial" ? " contact-tab-active" : "")} onClick={() => setActiveTab("historial")}>Historial</button>
            <button type="button" className={"contact-tab" + (activeTab === "archivos" ? " contact-tab-active" : "")} onClick={() => setActiveTab("archivos")}>Archivos</button>
            <button type="button" className={"contact-tab" + (activeTab === "propiedades" ? " contact-tab-active" : "")} onClick={() => setActiveTab("propiedades")}>Propiedades</button>
          </div>

          <div className="contact-tab-panel">
            {activeTab === "actividades" && <ContactActivitiesList activities={activities} />}
            {activeTab === "info" && (
              <div className="contact-info-personal">
                <div className="contact-info-assistant">
                  <div className="assistant-avatar">IO</div>
                  <div className="assistant-text">
                    <div className="assistant-title">Contale a Ivo-t algunas ideas sobre este cliente</div>
                    <div className="assistant-subtitle">Vamos a guardarlas para ayudarte a preparar seguimientos y mensajes.</div>
                  </div>
                </div>
                <div className="contact-info-personal-list">
                  {INFO_FIELDS.map((field) => (
                    <div key={field.id} className="contact-info-item">
                      <div className="contact-info-item-header">
                        <div className="contact-info-item-title">{field.title}</div>
                        <div className="contact-info-item-question">{field.question}</div>
                      </div>
                      <textarea className="textarea contact-info-item-input" rows={2} placeholder={field.placeholder} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "historial" && (
              <div className="contact-activities">
                {historyEvents.length === 0 ? <p className="contact-placeholder">No hay historial de eventos.</p> : (
                  historyEvents.map((ev: any) => (
                    <div key={ev.id} className="contact-activity-item">
                      <div className="contact-activity-icon">
                        {ev.type === 'cumpleanios' ? '🎂' : ev.type === 'mudanza' ? '📦' : ev.type === 'feedback' ? '📢' : '📅'}
                      </div>
                      <div className="contact-activity-content">
                        <div className="contact-activity-header">
                          <span className="contact-activity-title">{ev.title}</span>
                          <span className="contact-activity-date">{formatDate(ev.date)} {ev.startTime}</span>
                        </div>
                        <div className="contact-activity-description">
                          {ev.description || ev.detail || ev.summary}
                        </div>
                        <div className="contact-activity-meta">
                          <span className="chip chip-soft chip-activity">{ev.type}</span>
                          {ev.agent && <span>👤 {ev.agent}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            {activeTab === "archivos" && (
              <div className="contact-files">
                {files.length === 0 ? <p className="contact-placeholder">Todavía no hay archivos vinculados.</p> : (
                  <table className="table contact-files-table">
                    <thead><tr><th>Nombre</th><th>Tipo</th><th>Fecha</th></tr></thead>
                    <tbody>{files.map((f) => <tr key={f.id}><td>{f.nombre}</td><td>{f.tipo}</td><td>{formatDate(f.fechaSubida)}</td></tr>)}</tbody>
                  </table>
                )}
              </div>
            )}
            {activeTab === "propiedades" && (
              <div className="contact-properties">
                {properties.length === 0 ? (
                  <p className="contact-placeholder">No hay propiedades asociadas a este contacto.</p>
                ) : (
                  <div className="properties-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {properties.map(p => (
                      <div key={p.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{p.titulo}</h4>
                          <div style={{ color: '#666', fontSize: '0.9rem' }}>
                            {p.direccion} • {p.tipoOperacion} • {p.estado}
                          </div>
                        </div>
                        <Link to={`/propiedades/${p.id}`} className="btn btn-sm btn-outline-primary">
                          Ver Propiedad
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContactActivitiesListProps { activities: ContactActivity[]; }
const ContactActivitiesList: React.FC<ContactActivitiesListProps> = ({ activities }) => {
  if (activities.length === 0) return <p className="contact-placeholder">Todavía no hay actividades registradas.</p>;
  return (
    <div className="contact-activities">
      {activities.map((activity) => (
        <div key={activity.id} className="contact-activity-item">
          <div className="contact-activity-icon">{getActivityIcon(activity.tipo, activity.origenAgenda)}</div>
          <div className="contact-activity-content">
            <div className="contact-activity-header">
              <span className="contact-activity-title">{activity.titulo}</span>
              <span className="contact-activity-date">{formatDateTime(activity.fechaHora)}</span>
            </div>
            {activity.descripcion && <div className="contact-activity-description">{activity.descripcion}</div>}
            <div className="contact-activity-meta">
              <span className="chip chip-soft chip-activity">{getActivityLabel(activity.tipo, activity.origenAgenda)}</span>
              {activity.propiedadRelacionada && <span className="contact-activity-property">🏠 {activity.propiedadRelacionada}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function getActivityLabel(tipo: ActivityType, fromAgenda?: boolean): string {
  if (fromAgenda) return "Evento de agenda";
  return tipo.charAt(0) + tipo.slice(1).toLowerCase();
}

function getActivityIcon(tipo: ActivityType, fromAgenda?: boolean): string {
  if (fromAgenda || tipo === "EVENTO") return "📅";
  switch (tipo) {
    case "LLAMADA": return "📞";
    case "EMAIL": return "✉️";
    case "TAREA": return "✅";
    case "VISITA": return "👟";
    case "NOTA": return "📝";
    default: return "📌";
  }
}

function getInitials(nombre: string, apellido: string): string {
  const n = nombre?.trim()[0] ?? "";
  const a = apellido?.trim()[0] ?? "";
  return (n + a).toUpperCase();
}

function toSlug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Sin definir";
  const d = new Date(dateStr);
  // Ajuste de zona horaria simple para visualización (evitar que se corra un día)
  const userTimezoneOffset = d.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(d.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(dateTimeStr: string): string {
  const d = new Date(dateTimeStr);
  if (Number.isNaN(d.getTime())) return dateTimeStr;
  return d.toLocaleString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default ContactoDetalle;
