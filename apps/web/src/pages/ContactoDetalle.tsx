import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  agenteNombre?: string;
  nombre: string;
  apellido: string;
  telefonoPrincipal?: string;
  emailPrincipal?: string;
  tipoContacto: TipoContacto;
  etapa: EtapaContacto;
  origen?: string;
  fechaCumpleanios?: string; // ISO
  recordarCumpleanios: boolean;
  fechaMudanza?: string; // ISO
  recordarMudanza: boolean;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
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

/**
 * TODO: esto vendrá de la API / store global.
 * Por ahora usamos mock.
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
    direccion: "Av. Siempre Viva 123",
    ciudad: "Lomas de Zamora",
    provincia: "Buenos Aires",
    pais: "Argentina",
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
];

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
  {
    id: "a3",
    contactId: "c1",
    tipo: "NOTA",
    fechaHora: "2025-11-01T18:15:00",
    titulo: "Notas generales",
    descripcion:
      "Prefiere comunicación por WhatsApp, horario después de las 18 hs.",
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
  {
    id: "f2",
    contactId: "c1",
    nombre: "Reserva_PH_Banfield.pdf",
    tipo: "Reserva",
    fechaSubida: "2025-10-25",
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
  {
    id: "motivacion",
    title: "Motivación",
    question: "¿Qué impulsa este cambio?",
    placeholder:
      "Nuevo trabajo, familia en crecimiento, reducción de gastos, mejorar calidad de vida…",
  },
  {
    id: "expectativas",
    title: "Expectativas",
    question: "¿Qué espera lograr con esta operación?",
    placeholder:
      "Por ejemplo, buena rentabilidad, una venta rápida, una mudanza sin complicaciones…",
  },
  {
    id: "recursos",
    title: "Recursos",
    question: "¿Con qué recursos cuenta?",
    placeholder:
      "Por ejemplo, ahorro disponible, posibilidad de crédito, venta de otra propiedad…",
  },
];

const ContactoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const contact = useMemo(
    () => MOCK_CONTACTS.find((c) => c.id === id),
    [id]
  );

  const [activeTab, setActiveTab] = useState<"actividades" | "info" | "archivos">(
    "actividades"
  );

  // Estados locales para los toggles
  const [recordarCumple, setRecordarCumple] = useState(
    contact?.recordarCumpleanios ?? false
  );
  const [recordarMudanza, setRecordarMudanza] = useState(
    contact?.recordarMudanza ?? false
  );

  if (!contact) {
    return (
      <div className="page-content">
        <div className="card contact-detail-top-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="btn-icon-back"
            onClick={() => navigate("/contactos")}
            aria-label="Volver a contactos"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: 'var(--inmovia-text-main)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s'
            }}
          >
            ←
          </button>
          <h1 className="contact-top-title" style={{ margin: 0 }}>Contacto no encontrado</h1>
        </div>
      </div>
    );
  }

  const activities = MOCK_ACTIVITIES.filter(
    (a) => a.contactId === contact.id
  );
  const files = MOCK_FILES.filter((f) => f.contactId === contact.id);

  return (
    <div className="page-content">
      {/* Estilos locales para esta vista */}
      <style>{`
        .contact-detail-sidebar {
          border-radius: 2rem !important; /* Más curvo estilo Inmovia */
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05);
        }
        .btn-icon-back:hover {
          background-color: rgba(0,0,0,0.05);
        }
        /* Toggle Switch Styles */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
          background-color: #e2e8f0;
          border-radius: 999px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          border: none;
          padding: 0;
        }
        .toggle-switch[aria-checked="true"] {
          background-color: var(--inmovia-primary);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          transition: transform 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .toggle-switch[aria-checked="true"] .toggle-thumb {
          transform: translateX(20px);
        }
        .toggle-label {
          font-size: 0.85rem;
          color: var(--inmovia-text-muted);
          margin-left: 0.5rem;
          font-weight: 500;
        }
        .contact-reminder-toggle-container {
          display: flex;
          align-items: center;
        }
        /* Estilos circulares para inputs de información personal */
        .contact-info-item-input {
          width: 100%;
          box-sizing: border-box;
          border-radius: 1.5rem !important;
          padding: 1rem 1.5rem !important;
          border: 1px solid rgba(203, 213, 225, 0.8);
          background-color: #f8fafc;
          transition: all 0.2s ease;
          resize: none; /* Evitar que el resize rompa la estética */
        }
        .contact-info-item-input:focus {
          background-color: #ffffff;
          border-color: var(--inmovia-primary);
          box-shadow: 0 0 0 3px var(--inmovia-primary-soft);
          outline: none;
        }
      `}</style>

      {/* Card superior que ocupa todo el ancho con flecha integrada */}
      <div className="card contact-detail-top-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
        <button
          type="button"
          className="btn-icon-back"
          onClick={() => navigate("/contactos")}
          aria-label="Volver a contactos"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: 'var(--inmovia-text-main)',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s',
            lineHeight: 1
          }}
        >
          ←
        </button>
        <h1 className="contact-top-title" style={{ margin: 0 }}>Información de contacto</h1>
      </div>

      {/* Layout 2 columnas */}
      <div className="contact-detail-layout">
        {/* Columna izquierda */}
        <div className="card contact-detail-sidebar">
          <div className="contact-detail-sidebar-header">
            <div className="avatar avatar-lg">
              {getInitials(contact.nombre, contact.apellido)}
            </div>
            <div className="contact-detail-sidebar-title">
              <div className="contact-detail-name">
                {contact.nombre} {contact.apellido}
              </div>
              <div className="contact-detail-tags">
                <span className="chip chip-soft">{contact.tipoContacto}</span>
                <span
                  className={`chip chip-etapa-${toSlug(contact.etapa)} chip-soft-strong`}
                >
                  {contact.etapa}
                </span>
                {contact.origen && (
                  <span className="chip chip-outline">
                    Origen: {contact.origen}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botones rápidos */}
          <div className="contact-quick-actions">
            <button type="button" className="btn-quick">
              📝 Nota
            </button>
            <button type="button" className="btn-quick">
              📞 Llamada
            </button>
            <button type="button" className="btn-quick">
              ✉️ Correo
            </button>
            <button type="button" className="btn-quick">
              ✅ Tarea
            </button>
          </div>

          {/* Información de contacto */}
          <div className="contact-section">
            <h3 className="contact-section-title">Información de contacto</h3>
            <dl className="contact-info-list">
              <div className="contact-info-row">
                <dt>Teléfono</dt>
                <dd>{contact.telefonoPrincipal ?? "—"}</dd>
              </div>
              <div className="contact-info-row">
                <dt>Email</dt>
                <dd>{contact.emailPrincipal ?? "—"}</dd>
              </div>
              <div className="contact-info-row">
                <dt>Dirección</dt>
                <dd>
                  {contact.direccion
                    ? `${contact.direccion}${contact.ciudad ? ` – ${contact.ciudad}` : ""
                    }`
                    : "—"}
                </dd>
              </div>
              <div className="contact-info-row">
                <dt>Provincia / País</dt>
                <dd>
                  {contact.provincia || contact.pais
                    ? [contact.provincia, contact.pais]
                      .filter(Boolean)
                      .join(" – ")
                    : "—"}
                </dd>
              </div>
              <div className="contact-info-row">
                <dt>Tipo de contacto</dt>
                <dd>{contact.tipoContacto}</dd>
              </div>
              <div className="contact-info-row">
                <dt>Etapa</dt>
                <dd>{contact.etapa}</dd>
              </div>
              {contact.origen && (
                <div className="contact-info-row">
                  <dt>Origen</dt>
                  <dd>{contact.origen}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Cumpleaños y mudanza */}
          <div className="contact-section">
            <h3 className="contact-section-title">Recordatorios</h3>
            <div className="contact-reminder-row">
              <div>
                <div className="contact-reminder-label">Cumpleaños</div>
                <div className="contact-reminder-date">
                  {formatDate(contact.fechaCumpleanios)}
                </div>
              </div>
              <div className="contact-reminder-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={recordarCumple}
                  onClick={() => setRecordarCumple(!recordarCumple)}
                  className="toggle-switch"
                  aria-label="Recordar cumpleaños"
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="toggle-label">
                  {recordarCumple ? "Activado" : "Desactivado"}
                </span>
              </div>
            </div>
            <div className="contact-reminder-row">
              <div>
                <div className="contact-reminder-label">
                  Aniversario de mudanza
                </div>
                <div className="contact-reminder-date">
                  {formatDate(contact.fechaMudanza)}
                </div>
              </div>
              <div className="contact-reminder-toggle-container">
                <button
                  type="button"
                  role="switch"
                  aria-checked={recordarMudanza}
                  onClick={() => setRecordarMudanza(!recordarMudanza)}
                  className="toggle-switch"
                  aria-label="Recordar mudanza"
                >
                  <span className="toggle-thumb" />
                </button>
                <span className="toggle-label">
                  {recordarMudanza ? "Activado" : "Desactivado"}
                </span>
              </div>
            </div>
          </div>

          {/* Familia / relaciones (placeholder) */}
          <div className="contact-section">
            <h3 className="contact-section-title">Familia / relaciones</h3>
            <p className="contact-placeholder">
              Próximamente vas a poder vincular familiares y otros contactos
              relacionados.
            </p>
          </div>

          {/* Botón editar */}
          <div className="contact-sidebar-footer">
            <button type="button" className="btn btn-secondary btn-full">
              ✏️ Editar contacto
            </button>
          </div>
        </div>

        {/* Columna derecha: tabs */}
        <div className="card contact-detail-main">
          {/* Tabs */}
          <div className="contact-tabs">
            <button
              type="button"
              className={
                "contact-tab" +
                (activeTab === "actividades" ? " contact-tab-active" : "")
              }
              onClick={() => setActiveTab("actividades")}
            >
              Actividades
            </button>
            <button
              type="button"
              className={
                "contact-tab" + (activeTab === "info" ? " contact-tab-active" : "")
              }
              onClick={() => setActiveTab("info")}
            >
              Información personal
            </button>
            <button
              type="button"
              className={
                "contact-tab" +
                (activeTab === "archivos" ? " contact-tab-active" : "")
              }
              onClick={() => setActiveTab("archivos")}
            >
              Archivos
            </button>
          </div>

          <div className="contact-tab-panel">
            {activeTab === "actividades" && (
              <ContactActivitiesList activities={activities} />
            )}

            {activeTab === "info" && (
              <div className="contact-info-personal">
                <div className="contact-info-assistant">
                  <div className="assistant-avatar">IO</div>
                  <div className="assistant-text">
                    <div className="assistant-title">
                      Contale a Ivo-t algunas ideas sobre este cliente
                    </div>
                    <div className="assistant-subtitle">
                      Vamos a guardarlas para ayudarte a preparar seguimientos y
                      mensajes.
                    </div>
                  </div>
                </div>

                <div className="contact-info-personal-list">
                  {INFO_FIELDS.map((field) => (
                    <div key={field.id} className="contact-info-item">
                      <div className="contact-info-item-header">
                        <div className="contact-info-item-title">
                          {field.title}
                        </div>
                        <div className="contact-info-item-question">
                          {field.question}
                        </div>
                      </div>
                      <textarea
                        className="textarea contact-info-item-input"
                        rows={2}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "archivos" && (
              <div className="contact-files">
                {files.length === 0 ? (
                  <p className="contact-placeholder">
                    Todavía no hay archivos vinculados a este contacto.
                  </p>
                ) : (
                  <table className="table contact-files-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Fecha de subida</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((file) => (
                        <tr key={file.id}>
                          <td>{file.nombre}</td>
                          <td>{file.tipo}</td>
                          <td>{formatDate(file.fechaSubida)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="contact-files-actions">
                  <button type="button" className="btn btn-secondary">
                    Subir archivo
                  </button>
                  <button type="button" className="btn btn-outline">
                    Ver en Documentos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ContactActivitiesListProps {
  activities: ContactActivity[];
}

const ContactActivitiesList: React.FC<ContactActivitiesListProps> = ({
  activities,
}) => {
  if (activities.length === 0) {
    return (
      <p className="contact-placeholder">
        Todavía no hay actividades registradas para este contacto.
      </p>
    );
  }

  return (
    <div className="contact-activities">
      {activities.map((activity) => (
        <div key={activity.id} className="contact-activity-item">
          <div className="contact-activity-icon">
            {getActivityIcon(activity.tipo, activity.origenAgenda)}
          </div>
          <div className="contact-activity-content">
            <div className="contact-activity-header">
              <span className="contact-activity-title">{activity.titulo}</span>
              <span className="contact-activity-date">
                {formatDateTime(activity.fechaHora)}
              </span>
            </div>
            {activity.descripcion && (
              <div className="contact-activity-description">
                {activity.descripcion}
              </div>
            )}
            <div className="contact-activity-meta">
              <span className="chip chip-soft chip-activity">
                {getActivityLabel(activity.tipo, activity.origenAgenda)}
              </span>
              {activity.propiedadRelacionada && (
                <span className="contact-activity-property">
                  🏠 {activity.propiedadRelacionada}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function getActivityLabel(tipo: ActivityType, fromAgenda?: boolean): string {
  if (fromAgenda) return "Evento de agenda";
  switch (tipo) {
    case "LLAMADA":
      return "Llamada";
    case "EMAIL":
      return "Correo";
    case "TAREA":
      return "Tarea";
    case "VISITA":
      return "Visita";
    case "NOTA":
      return "Nota";
    case "EVENTO":
      return "Evento";
    default:
      return "Actividad";
  }
}

function getActivityIcon(tipo: ActivityType, fromAgenda?: boolean): string {
  if (fromAgenda || tipo === "EVENTO") return "📅";
  switch (tipo) {
    case "LLAMADA":
      return "📞";
    case "EMAIL":
      return "✉️";
    case "TAREA":
      return "✅";
    case "VISITA":
      return "👟";
    case "NOTA":
      return "📝";
    default:
      return "📌";
  }
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Sin definir";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateTimeStr: string): string {
  const d = new Date(dateTimeStr);
  if (Number.isNaN(d.getTime())) return dateTimeStr;
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default ContactoDetalle;
