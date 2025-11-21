// apps/web/src/pages/ChatInterno.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

type ChatItem = {
  id: string;
  title: string;
  subtitle: string;
  unread?: number;
};

type Message = {
  id: string;
  from: "yo" | "otro";
  text: string;
  time: string;
};

const DUMMY_CHATS: ChatItem[] = [
  { id: "general", title: "Canal general", subtitle: "Anuncios de la oficina", unread: 2 },
  { id: "ventas", title: "Equipo Ventas", subtitle: "Consultas sobre operaciones" },
  { id: "admin", title: "Administración", subtitle: "Temas administrativos" },
];

const DUMMY_MESSAGES: Record<string, Message[]> = {
  general: [
    { id: "m1", from: "otro", text: "Recordatorio: reunión mañana a las 10 hs.", time: "09:12" },
    { id: "m2", from: "yo", text: "Perfecto, gracias.", time: "09:15" },
  ],
  ventas: [
    { id: "m3", from: "otro", text: "¿Quién puede acompañar visita en Alsina 770?", time: "11:00" },
    { id: "m4", from: "yo", text: "Yo puedo a las 17 hs.", time: "11:05" },
  ],
  admin: [{ id: "m5", from: "otro", text: "Se cargó la nueva plantilla de reserva.", time: "16:20" }],
};

export default function ChatInterno() {
  const [selectedChatId, setSelectedChatId] = useState<string>("general");
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(DUMMY_MESSAGES);
  const [draft, setDraft] = useState<string>("");

  const chat = DUMMY_CHATS.find((c) => c.id === selectedChatId) ?? DUMMY_CHATS[0];
  const messages = messagesByChat[selectedChatId] ?? [];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const newMsg: Message = {
      id: `local-${Date.now()}`,
      from: "yo",
      text,
      time: new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessagesByChat((prev) => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] ?? []), newMsg],
    }));
    setDraft("");
  }

  return (
    <div className="app-shell">
      {/* /<Sidebar />/ */}

      <div className="app-main app-chatinterno">
        <div className="glass-panel">
          {/* Marca arriba-izquierda */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <Link
              to="/dashboard"
              className="brand"
              style={{ textDecoration: "none", color: "inherit" }}
              title="Ir al Dashboard"
            >
              <span className="brand-badge" />
              Inmovia Office
            </Link>
          </div>

          <div className="dash-header">
            <h1 className="brand-title">Chat interno</h1>
            <p className="brand-sub">
              Comunicación entre integrantes de la oficina. Ideal para coordinar visitas, reservas y tareas diarias.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 16,
              minHeight: "60vh",
            }}
          >
            {/* Lista de chats */}
            <aside
              style={{
                borderRadius: 16,
                padding: 12,
                background: "rgba(15,30,55,0.85)",
                border: "1px solid rgba(141,197,255,0.2)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Canales</div>
              {DUMMY_CHATS.map((c) => {
                const active = c.id === selectedChatId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedChatId(c.id)}
                    className="btn"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      background: active ? "rgba(55,168,255,0.14)" : "rgba(10,24,50,0.8)",
                      borderColor: active ? "rgba(55,168,255,0.35)" : "rgba(23,48,79,0.8)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{c.title}</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{c.subtitle}</span>
                    {c.unread ? (
                      <span
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 999,
                          background: "rgba(55,168,255,0.3)",
                        }}
                      >
                        {c.unread} nuevos
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </aside>

            {/* Panel de conversación */}
            <section
              style={{
                borderRadius: 16,
                padding: 16,
                background: "rgba(8,20,44,0.8)",
                border: "1px solid rgba(141,197,255,0.22)",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              <header
                style={{
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: "1px solid rgba(141,197,255,0.22)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{chat.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{chat.subtitle}</div>
                </div>
                <small style={{ opacity: 0.7 }}>
                  Próximamente: menciones, adjuntos y canales por propiedad.
                </small>
              </header>

              {/* Mensajes */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "4px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      justifyContent: m.from === "yo" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "8px 12px",
                        borderRadius: 14,
                        fontSize: 14,
                        background:
                          m.from === "yo"
                            ? "linear-gradient(135deg, var(--brand), var(--brand-2))"
                            : "rgba(18,36,63,0.9)",
                        border:
                          m.from === "yo"
                            ? "1px solid rgba(42,168,255,0.5)"
                            : "1px solid rgba(141,197,255,0.18)",
                      }}
                    >
                      <div>{m.text}</div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          opacity: 0.7,
                          textAlign: "right",
                        }}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", opacity: 0.7, marginTop: 24 }}>
                    No hay mensajes aún en este canal.
                  </div>
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSend}
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Escribí un mensaje para la oficina..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(141,197,255,0.3)",
                    padding: "8px 14px",
                    background: "rgba(10,24,50,0.9)",
                    color: "#eaf3ff",
                    fontSize: 14,
                  }}
                />
                <button type="submit" className="btn btn-primary">
                  Enviar
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
