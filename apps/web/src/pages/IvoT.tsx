// apps/web/src/pages/IvoT.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

type Tool = {
  id: string;
  name: string;
  description: string;
  badge?: string;
};

type ChatMsg = {
  id: string;
  from: "ivo-t" | "yo";
  text: string;
  time: string;
};

const TOOLS: Tool[] = [
  {
    id: "chat",
    name: "Chat general",
    description: "Consultas rápidas sobre documentos, propiedades y procesos internos.",
  },
  {
    id: "buscador",
    name: "Buscador de propiedades",
    description: "Encontrá propiedades por zona, precio y tipo, usando la base de la oficina.",
  },
  {
    id: "acm",
    name: "ACM Express",
    description: "Estimaciones de valor de mercado para tasaciones rápidas.",
    badge: "Próximamente",
  },
  {
    id: "agenda",
    name: "Agenda & recordatorios",
    description: "Agendá visitas, recordatorios de cumpleaños y aniversarios de mudanza.",
  },
];

const INITIAL_MSGS: ChatMsg[] = [
  {
    id: "m1",
    from: "ivo-t",
    text: "Hola, soy Ivo-t. ¿En qué te ayudo hoy?",
    time: "09:00",
  },
  {
    id: "m2",
    from: "ivo-t",
    text: "Podés pedirme que prepare un texto para redes, que agende una visita o que resuma una conversación.",
    time: "09:01",
  },
];

export default function IvoT() {
  const [selectedToolId, setSelectedToolId] = useState<string>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MSGS);
  const [draft, setDraft] = useState<string>("");

  const selectedTool =
    TOOLS.find((t) => t.id === selectedToolId) ?? TOOLS[0];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      from: "yo",
      text,
      time: now,
    };

    // Maqueta: agregamos sólo el mensaje del usuario.
    // Más adelante acá llamamos al backend de Ivo-t / OpenAI.
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
  }

  return (
    <div className="app-main">
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
          <h1 className="brand-title">Ivo-t</h1>
          <p className="brand-sub">
            Asistente IA de la oficina. Diseñado para trabajar con tus documentos,
            propiedades y agenda.
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
          {/* Lista de herramientas de Ivo-t */}
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
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              Herramientas de Ivo-t
            </div>
            {TOOLS.map((tool) => {
              const active = tool.id === selectedToolId;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setSelectedToolId(tool.id)}
                  className="btn"
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: active
                      ? "rgba(55,168,255,0.16)"
                      : "rgba(10,24,50,0.85)",
                    borderColor: active
                      ? "rgba(55,168,255,0.4)"
                      : "rgba(23,48,79,0.9)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{tool.name}</span>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    {tool.description}
                  </span>
                  {tool.badge && (
                    <span
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        padding: "2px 6px",
                        borderRadius: 999,
                        border: "1px solid rgba(55,168,255,0.4)",
                        background: "rgba(55,168,255,0.08)",
                      }}
                    >
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                opacity: 0.8,
              }}
            >
              Desde tu perfil de <strong>Owner</strong> vas a poder habilitar o
              deshabilitar estas herramientas por oficina.
            </div>
          </aside>

          {/* Panel principal de chat con Ivo-t */}
          <section
            style={{
              borderRadius: 16,
              padding: 16,
              background: "rgba(8,20,44,0.9)",
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
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>
                  {selectedTool.name}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  {selectedTool.description}
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontSize: 12,
                  opacity: 0.8,
                  maxWidth: 260,
                }}
              >
                En la versión completa, esta vista se conecta al backend de Ivo-t
                y a OpenAI para responder en tiempo real y agendar eventos.
              </div>
            </header>

            {/* Conversación */}
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
                    justifyContent:
                      m.from === "yo" ? "flex-end" : "flex-start",
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
                          ? "1px solid rgba(42,168,255,0.6)"
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
                placeholder="Escribí tu consulta para Ivo-t..."
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
  );
}
