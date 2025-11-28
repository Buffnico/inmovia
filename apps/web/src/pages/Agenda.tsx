import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Agenda.css";

type CalendarStatus = "checking" | "connected" | "disconnected" | "error";

interface AgendaEvent {
  id: string;
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  agent?: string;
  contactId?: string;
  participants?: { userId: string; status: 'invited' | 'accepted' | 'declined'; comment?: string }[];
  assignedUserId?: string;
}

interface UserSummary {
  id: string;
  name: string;
  role: string;
}

// Base de la API (dev: localhost:3001)
// Base de la API (dev: localhost:3001/api)
const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

// Helper para construir URLs de API
// Maneja casos donde el path ya incluye /api o no
function apiUrl(endpoint: string) {
  // Si el endpoint empieza con /api, lo quitamos para evitar duplicados
  // ya que API_BASE_URL debería incluirlo
  const cleanEndpoint = endpoint.startsWith("/api") ? endpoint.substring(4) : endpoint;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

const FALLBACK_EVENT_TYPES = [
  "visita_propiedad",
  "llamada",
  "reunion",
  "firma",
  "cumpleanios",
  "mudanza",
  "feedback",
  "otro",
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  "visita_propiedad": "Visita Propiedad",
  "llamada": "Llamada",
  "reunion": "Reunión",
  "firma": "Firma",
  "cumpleanios": "Cumpleaños",
  "mudanza": "Mudanza",
  "feedback": "Feedback",
  "otro": "Otro"
};

interface CalendarCell {
  key: string;
  date?: string;
  dayNumber?: number;
  isToday?: boolean;
  hasEvents?: boolean;
}

import { useAuth } from "../store/auth";

const Agenda: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<CalendarStatus>("checking");
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "visita_propiedad",
    date: "",
    startTime: "10:00",
    endTime: "11:00",
    detail: "",
    agent: "",
    participants: [] as string[], // IDs of selected users
  });

  const [availableUsers, setAvailableUsers] = useState<UserSummary[]>([]);

  // Load available users for sharing
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(apiUrl("/api/users"), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Filter out current user
          setAvailableUsers(data.data.filter((u: UserSummary) => u.id !== user?.id));
        }
      } catch (e) {
        console.error("Error loading users", e);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  // 🗓️ Filtro de fecha y tipo
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("todos");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>("");

  // Mes mostrado en el mini calendario de la izquierda
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date());

  useEffect(() => {
    loadStatus();
    loadEvents();
  }, []);

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/api/calendar/status"), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error de estado");
      const data = await res.json();

      console.log("📡 /api/calendar/status →", data);

      setStatus(data.connected ? "connected" : "disconnected");
      setStatusMessage(data.message || "");
    } catch (err) {
      console.error("Error loadStatus:", err);
      setStatus("error");
      setStatusMessage("No pudimos comprobar el estado. Intenta reconectar la cuenta.");
    } finally {
      setLoadingStatus(false);
    }
  }

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/api/calendar/events?days=7"), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar eventos");
      const data = await res.json();

      console.log("📡 /api/calendar/events →", data);

      const mapped: AgendaEvent[] = (data.events || []).map((ev: any) => ({
        id: ev.id,
        summary: ev.summary || "Evento",
        date: ev.date || "",
        startTime: ev.startTime || "",
        endTime: ev.endTime || "",
        type: ev.type || "",
        agent: ev.agent || "",
        contactId: ev.contactId,
        participants: ev.participants || [],
        assignedUserId: ev.assignedUserId
      }));

      setEvents(mapped);
    } catch (err) {
      console.error("Error loadEvents:", err);
    } finally {
      setLoadingEvents(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!form.title || !form.date) {
      setFeedback({ type: "error", msg: "El título y la fecha son obligatorios." });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl("/api/calendar/events"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          detail: form.detail,
          agent: form.agent,
          participants: form.participants
        }),
      });

      if (!res.ok) throw new Error("No se pudo crear el evento");
      const created = await res.json();

      setFeedback({ type: "ok", msg: "Evento creado en Google Calendar." });
      setForm((prev) => ({
        ...prev,
        title: "",
        detail: "",
        agent: "",
        participants: []
      }));

      setEvents((prev) => [
        ...prev,
        {
          id: created.id || String(Date.now()),
          summary: created.summary || form.title,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          type: form.type,
          agent: form.agent,
          participants: form.participants.map(uid => ({ userId: uid, status: 'invited' as const }))
        },
      ]);
    } catch (err) {
      console.error("Error handleSubmit:", err);
      setFeedback({ type: "error", msg: "No se pudo crear el evento. Intenta nuevamente." });
    } finally {
      setSaving(false);
    }
  }

  async function handleRespondInvitation(eventId: string, status: 'accepted' | 'declined') {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl(`/api/agenda/${eventId}/responder-invitacion`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        // Refresh events
        loadEvents();
      } else {
        alert("Error al responder invitación");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleReconnect() {
    const url = apiUrl("/api/calendar/connect");
    console.log("🔗 Redirigiendo a:", url);
    window.location.href = url;
  }

  function formatDateLabel(isoDate: string) {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00");
    return date.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  }

  function statusChipClass() {
    if (status === "connected") return "agenda-chip agenda-chip--ok";
    if (status === "disconnected") return "agenda-chip agenda-chip--off";
    if (status === "error") return "agenda-chip agenda-chip--error";
    return "agenda-chip";
  }

  function statusText() {
    if (loadingStatus) return "Comprobando conexión...";
    if (status === "connected") return "Conectado a Google Calendar";
    if (status === "disconnected") return "Cuenta desconectada";
    if (status === "error") return "Error de conexión";
    return "";
  }

  // 🗓️ ---- Lógica del mini calendario + filtros ----

  const todayIso = new Date().toISOString().slice(0, 10);

  function buildCalendarCells(): CalendarCell[] {
    const cells: CalendarCell[] = [];

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth(); // 0-11
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Queremos que la semana arranque en lunes
    const firstWeekday = (firstDay.getDay() + 6) % 7; // 0=lunes, 6=domingo

    // Celdas vacías antes del día 1
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ key: `empty-${i}` });
    }

    // Días del mes
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateObj = new Date(year, month, day);
      const iso = dateObj.toISOString().slice(0, 10);

      const hasEvents = events.some((ev) => ev.date === iso);
      const isToday = iso === todayIso;

      cells.push({
        key: iso,
        date: iso,
        dayNumber: day,
        hasEvents,
        isToday,
      });
    }

    return cells;
  }

  const calendarCells = buildCalendarCells();

  function handleCalendarDayClick(dateStr: string) {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  function changeMonth(offset: number) {
    setCalendarMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + offset);
      return d;
    });
  }

  const monthLabel = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  // Tipos disponibles para el filtro (dinámicos + fallback)
  const dynamicTypes = Array.from(
    new Set(
      events
        .map((ev) => ev.type)
        .filter((t): t is string => !!t && t.trim().length > 0)
    )
  );

  const typeOptions =
    dynamicTypes.length > 0 ? dynamicTypes : FALLBACK_EVENT_TYPES;

  // Aplicar filtros sobre los eventos
  const filteredEvents = events.filter((ev) => {
    const matchesType =
      selectedTypeFilter === "todos" ||
      (ev.type || "") === selectedTypeFilter;

    const matchesDate =
      !selectedDate || ev.date === selectedDate;

    const matchesAgent =
      !selectedAgentFilter ||
      (ev.agent && ev.agent.toLowerCase().includes(selectedAgentFilter.toLowerCase()));

    return matchesType && matchesDate && matchesAgent;
  });

  function clearFilters() {
    setSelectedDate(null);
    setSelectedTypeFilter("todos");
    setSelectedAgentFilter("");
  }

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + "T00:00:00").toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    })
    : null;

  return (
    <div className="page-inner agenda-page">
      <div className="agenda-layout">
        {/* Columna izquierda: mini calendario + filtros */}
        <aside className="agenda-calendar-pane">
          <div className="agenda-calendar-header">
            <h2 className="agenda-calendar-title">Calendario</h2>
            <div className="agenda-calendar-controls">
              <div className="agenda-calendar-nav">
                <button
                  type="button"
                  onClick={() => changeMonth(-1)}
                  aria-label="Mes anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => changeMonth(1)}
                  aria-label="Mes siguiente"
                >
                  ›
                </button>
              </div>
              <p className="agenda-calendar-month">{monthLabel}</p>
            </div>
          </div>

          <div className="agenda-filter">
            <label className="agenda-filter-label" htmlFor="typeFilter">
              Tipo de evento
            </label>
            <select
              id="typeFilter"
              className="agenda-filter-select"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
            >
              <option value="todos">Todos los tipos</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {['OWNER', 'ADMIN', 'RECEPCIONISTA'].includes(user?.role || '') && (
            <div className="agenda-filter">
              <label className="agenda-filter-label">Filtrar por Agente</label>
              <input
                type="text"
                className="agenda-filter-input" // Reuse existing class or add style
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                placeholder="Nombre del agente..."
                value={selectedAgentFilter}
                onChange={(e) => setSelectedAgentFilter(e.target.value)}
              />
            </div>
          )}

          <div className="agenda-calendar-weekdays">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <span key={`${d}-${i}`} className="agenda-cal-weekday">
                {d}
              </span>
            ))}
          </div>

          <div className="agenda-cal-grid">
            {calendarCells.map((cell) =>
              cell.date ? (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    "agenda-cal-day",
                    cell.isToday ? "agenda-cal-day--today" : "",
                    selectedDate === cell.date ? "agenda-cal-day--selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleCalendarDayClick(cell.date!)}
                >
                  <span className="agenda-cal-day-number">
                    {cell.dayNumber}
                  </span>
                  {cell.hasEvents && (
                    <span className="agenda-cal-dot" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span
                  key={cell.key}
                  className="agenda-cal-day agenda-cal-day--empty"
                />
              )
            )}
          </div>

          <div className="agenda-calendar-legend">
            <span className="agenda-legend-item">
              <span className="agenda-cal-dot agenda-cal-dot--legend" /> Con
              eventos
            </span>
            <button
              type="button"
              className="agenda-clear-filters"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </aside>

        {/* Columna principal: estado + lista + formulario */}
        <div className="agenda-card">
          <header className="agenda-header">
            <h1 className="agenda-title">Agenda &amp; Recordatorios</h1>
            <p className="agenda-subtitle">
              Sincronizada con Google Calendar de la cuenta del Owner. Usamos
              esta agenda como fuente principal para visitas, llamadas,
              cumpleaños y aniversarios.
            </p>
          </header>

          <div className="agenda-content">
            {/* Columna izquierda grande: estado + lista */}
            <section className="agenda-column agenda-column-left">
              <div className="agenda-status-card">
                <div className="agenda-status-top">
                  <div>
                    <span className={statusChipClass()}>
                      <span className="agenda-chip-dot" />
                      {statusText()}
                    </span>
                    {statusMessage && (
                      <p className="agenda-status-message">{statusMessage}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="agenda-reconnect-btn"
                    onClick={handleReconnect}
                  >
                    {status === "connected" ? "Reconectar cuenta" : "Conectar cuenta"}
                  </button>
                </div>

                <p className="agenda-status-footnote">
                  La conexión se realiza solo con la cuenta del Owner. Los
                  agentes usan esta agenda compartida para ver sus próximos
                  compromisos.
                </p>
              </div>

              <div className="agenda-events">
                <div className="agenda-section-header">
                  <div>
                    <h2 className="agenda-section-title">Próximos 7 días</h2>
                    {selectedDateLabel && (
                      <p className="agenda-filter-chip">
                        Filtrando por{" "}
                        <span className="agenda-filter-chip-strong">
                          {selectedDateLabel}
                        </span>
                      </p>
                    )}
                  </div>
                  <span className="agenda-section-badge">
                    {filteredEvents.length}{" "}
                    {filteredEvents.length === 1 ? "evento" : "eventos"}
                  </span>
                </div>

                {loadingEvents ? (
                  <p className="agenda-text-muted">Cargando eventos...</p>
                ) : filteredEvents.length === 0 ? (
                  <p className="agenda-empty">
                    No hay eventos próximos que coincidan con el filtro
                    seleccionado. Crea tu primera visita, entrevista o
                    recordatorio desde el panel de la derecha.
                  </p>
                ) : (
                  <ul className="agenda-events-list">
                    {filteredEvents.map((ev) => (
                      <li key={ev.id} className="agenda-event-item">
                        <div className="agenda-event-date">
                          {formatDateLabel(ev.date)}
                        </div>
                        <div className="agenda-event-main">
                          <div className="agenda-event-title">{ev.summary}</div>
                          <div className="agenda-event-meta">
                            {ev.startTime && ev.endTime && (
                              <span>
                                {ev.startTime} - {ev.endTime}
                              </span>
                            )}
                            {ev.type && (
                              <span className="agenda-event-pill">
                                {EVENT_TYPE_LABELS[ev.type] || ev.type}
                              </span>
                            )}
                            {ev.agent && <span>👤 {ev.agent}</span>}
                            {ev.contactId && (
                              <Link to={`/contactos/${ev.contactId}`} style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                                Ver contacto →
                              </Link>
                            )}
                          </div>
                          {/* Participants Display */}
                          {ev.participants && ev.participants.length > 0 && (
                            <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#666' }}>
                              <strong>Invitados:</strong>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                                {ev.participants.map(p => {
                                  const uName = availableUsers.find(u => u.id === p.userId)?.name || 'Usuario';
                                  let statusColor = '#999';
                                  if (p.status === 'accepted') statusColor = 'green';
                                  if (p.status === 'declined') statusColor = 'red';

                                  return (
                                    <span key={p.userId} style={{ border: '1px solid #eee', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
                                      {uName} <span style={{ color: statusColor }}>({p.status === 'invited' ? 'Invitado' : (p.status === 'accepted' ? 'Aceptado' : 'Rechazado')})</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {/* Invitation Response Actions */}
                          {ev.participants?.some(p => p.userId === user?.id && p.status === 'invited') && (
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleRespondInvitation(ev.id, 'accepted')}
                                style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                ✓ Aceptar
                              </button>
                              <button
                                onClick={() => handleRespondInvitation(ev.id, 'declined')}
                                style={{ fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                ✕ Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Columna derecha: formulario */}
            <section className="agenda-column agenda-column-right">
              <div className="agenda-form-header">
                <h2 className="agenda-section-title">Agregar evento</h2>
                <p className="agenda-text-muted">
                  Crea rápidamente visitas, entrevistas, firmas de contrato o
                  recordatorios importantes. Se guardarán directamente en tu
                  Google Calendar.
                </p>
              </div>

              {feedback && (
                <div
                  className={
                    feedback.type === "ok"
                      ? "agenda-feedback agenda-feedback--ok"
                      : "agenda-feedback agenda-feedback--error"
                  }
                >
                  {feedback.msg}
                </div>
              )}

              <form className="agenda-form" onSubmit={handleSubmit}>
                <div className="agenda-form-row">
                  <label className="agenda-label" htmlFor="title">
                    Título
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className="agenda-input"
                    placeholder="Visita a propiedad, entrevista, firma de contrato..."
                    value={form.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="agenda-form-row">
                  <label className="agenda-label" htmlFor="type">
                    Tipo de evento
                  </label>
                  <select
                    id="type"
                    name="type"
                    className="agenda-input"
                    value={form.type}
                    onChange={handleChange}
                  >
                    {FALLBACK_EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {EVENT_TYPE_LABELS[t] || t}
                      </option>
                    ))}
                  </select>
                </div>

                {user?.role !== 'AGENTE' && (
                  <div className="agenda-form-row">
                    <label className="agenda-label" htmlFor="agent">
                      Agente responsable
                    </label>
                    <input
                      id="agent"
                      name="agent"
                      type="text"
                      className="agenda-input"
                      placeholder="Nombre del agente (ej: Juan Pérez)"
                      value={form.agent}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="agenda-form-row agenda-form-row-inline">
                  <div className="agenda-form-field">
                    <label className="agenda-label" htmlFor="date">
                      Fecha
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="agenda-input"
                      value={form.date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="agenda-form-field">
                    <label className="agenda-label" htmlFor="startTime">
                      Desde
                    </label>
                    <input
                      id="startTime"
                      name="startTime"
                      type="time"
                      className="agenda-input"
                      value={form.startTime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="agenda-form-field">
                    <label className="agenda-label" htmlFor="endTime">
                      Hasta
                    </label>
                    <input
                      id="endTime"
                      name="endTime"
                      type="time"
                      className="agenda-input"
                      value={form.endTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="agenda-form-row">
                  <label className="agenda-label" htmlFor="detail">
                    Detalle (opcional)
                  </label>
                  <textarea
                    id="detail"
                    name="detail"
                    className="agenda-input agenda-textarea"
                    placeholder="Dirección de la propiedad, nombre del cliente, notas internas..."
                    rows={3}
                    value={form.detail}
                    onChange={handleChange}
                  />
                </div>

                <div className="agenda-form-row">
                  <label className="agenda-label">Compartir con</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '6px' }}>
                    {availableUsers.length === 0 ? (
                      <span style={{ fontSize: '0.85rem', color: '#999' }}>No hay otros usuarios disponibles.</span>
                    ) : (
                      availableUsers.map(u => (
                        <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={form.participants.includes(u.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(prev => ({ ...prev, participants: [...prev.participants, u.id] }));
                              } else {
                                setForm(prev => ({ ...prev, participants: prev.participants.filter(id => id !== u.id) }));
                              }
                            }}
                          />
                          {u.name} <span style={{ fontSize: '0.75rem', color: '#666' }}>({u.role})</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className="agenda-form-footer">
                  <span className="agenda-text-muted">
                    El evento se creará en Google Calendar de Inmovia Office.
                  </span>
                  <button
                    type="submit"
                    className="agenda-submit-btn"
                    disabled={saving || status === "checking"}
                  >
                    {saving ? "Guardando..." : "Guardar evento"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agenda;
