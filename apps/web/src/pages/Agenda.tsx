import React, { useEffect, useState } from "react";

type CalendarStatus = "checking" | "connected" | "disconnected" | "error";

interface AgendaEvent {
  id: string;
  summary: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  agent?: string;
}

// Base de la API
const API_BASE =
  (import.meta as any).env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "");

function apiUrl(path: string) {
  // Si API_BASE está definido -> http://localhost:3001/api/...
  // Si no, usamos el mismo host (ej: proxy de Vite en el futuro)
  if (API_BASE) return `${API_BASE}${path}`;
  return path;
}

console.log("🔧 Agenda usando API_BASE =", API_BASE);


const Agenda: React.FC = () => {
  const [status, setStatus] = useState<CalendarStatus>("checking");
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    type: "Visita con comprador",
    date: "",
    startTime: "10:00",
    endTime: "11:00",
    detail: "",
    agent: "",
  });

  useEffect(() => {
    loadStatus();
    loadEvents();
  }, []);

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch(apiUrl("/api/calendar/status"));
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
      const res = await fetch(apiUrl("/api/calendar/events?days=7"));
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
      const res = await fetch(apiUrl("/api/calendar/events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          detail: form.detail,
          agent: form.agent,
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
        },
      ]);
    } catch (err) {
      console.error("Error handleSubmit:", err);
      setFeedback({ type: "error", msg: "No se pudo crear el evento. Intenta nuevamente." });
    } finally {
      setSaving(false);
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

  return (
    <div className="page-inner agenda-page">
      <div className="agenda-card">
        <header className="agenda-header">
          <h1 className="agenda-title">Agenda &amp; Recordatorios</h1>
          <p className="agenda-subtitle">
            Sincronizada con Google Calendar de la cuenta del Owner. Usamos esta agenda como
            fuente principal para visitas, llamadas, cumpleaños y aniversarios.
          </p>
        </header>

        <div className="agenda-content">
          {/* Columna izquierda */}
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
                La conexión se realiza solo con la cuenta del Owner. Los agentes usan esta agenda
                compartida para ver sus próximos compromisos.
              </p>
            </div>

            <div className="agenda-events">
              <div className="agenda-section-header">
                <h2 className="agenda-section-title">Próximos 7 días</h2>
                <span className="agenda-section-badge">
                  {events.length} {events.length === 1 ? "evento" : "eventos"}
                </span>
              </div>

              {loadingEvents ? (
                <p className="agenda-text-muted">Cargando eventos...</p>
              ) : events.length === 0 ? (
                <p className="agenda-empty">
                  No hay eventos próximos en el calendario. Crea tu primera visita, entrevista o
                  recordatorio desde el panel de la derecha.
                </p>
              ) : (
                <ul className="agenda-events-list">
                  {events.map((ev) => (
                    <li key={ev.id} className="agenda-event-item">
                      <div className="agenda-event-date">{formatDateLabel(ev.date)}</div>
                      <div className="agenda-event-main">
                        <div className="agenda-event-title">{ev.summary}</div>
                        <div className="agenda-event-meta">
                          {ev.startTime && ev.endTime && (
                            <span>
                              {ev.startTime} - {ev.endTime}
                            </span>
                          )}
                          {ev.type && (
                            <span className="agenda-event-pill">{ev.type}</span>
                          )}
                          {ev.agent && (
                            <span>👤 {ev.agent}</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Columna derecha */}
          <section className="agenda-column agenda-column-right">
            <div className="agenda-form-header">
              <h2 className="agenda-section-title">Agregar evento</h2>
              <p className="agenda-text-muted">
                Crea rápidamente visitas, entrevistas, firmas de contrato o recordatorios
                importantes. Se guardarán directamente en tu Google Calendar.
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
                  <option value="Visita con comprador">Visita con comprador</option>
                  <option value="Visita de captación">Visita de captación</option>
                  <option value="Llamada de seguimiento">Llamada de seguimiento</option>
                  <option value="Reunión interna">Reunión interna</option>
                  <option value="Firma de reserva / boleto">Firma de reserva / boleto</option>
                  <option value="Post-venta / aniversario">Post-venta / aniversario</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

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
  );
};

export default Agenda;
