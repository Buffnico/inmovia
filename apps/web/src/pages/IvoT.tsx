// apps/web/src/pages/IvoT.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ivoLogo from "../assets/ivot-logo.png";

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

const API_URL = "http://localhost:3001/api/ivot/chat";

export default function IvoT() {
  const [selectedToolId, setSelectedToolId] = useState<string>("chat");
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MSGS);
  const [draft, setDraft] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTool = TOOLS.find((t) => t.id === selectedToolId) ?? TOOLS[0];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;

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

    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    setIsLoading(true);

    try {
      // Preparar historial para OpenAI
      const history = messages
        .concat(userMsg)
        .map((m) => ({
          role: m.from === "yo" ? "user" : "assistant",
          content: m.text,
        }));

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: history }),
      });

      if (!response.ok) throw new Error("Error en la respuesta");

      const data = await response.json();

      const botMsg: ChatMsg = {
        id: `b-${Date.now()}`,
        from: "ivo-t",
        text: data.message,
        time: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error al comunicarse con Ivo-t:", error);
      const errorMsg: ChatMsg = {
        id: `e-${Date.now()}`,
        from: "ivo-t",
        text: "Lo siento, hubo un problema. Asegurate de que el backend esté ejecutándose en localhost:3001.",
        time: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="page-inner">
      <div className="page-header">
        <h1 className="page-title">Ivo-t</h1>
        <p className="page-subtitle">
          Asistente IA de la oficina. Diseñado para trabajar con tus documentos,
          propiedades y agenda.
        </p>
      </div>

      <div className="ivot-page-container">
        {/* Sidebar de Herramientas */}
        <aside className="ivot-sidebar">
          <div style={{ fontWeight: 600, padding: "0 0.5rem", color: "#64748b", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Herramientas
          </div>
          {TOOLS.map((tool) => {
            const active = tool.id === selectedToolId;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setSelectedToolId(tool.id)}
                className={`ivot-tool-item ${active ? "active" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                  <span className="ivot-tool-name">{tool.name}</span>
                  {tool.badge && (
                    <span
                      style={{
                        fontSize: "0.65rem",
                        padding: "2px 6px",
                        borderRadius: 999,
                        background: "rgba(59, 130, 246, 0.1)",
                        color: "#2563eb",
                        fontWeight: 600,
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      {tool.badge}
                    </span>
                  )}
                </div>
                <span className="ivot-tool-desc">{tool.description}</span>
              </button>
            );
          })}

          <div style={{ marginTop: "auto", padding: "1rem", fontSize: "0.8rem", color: "#94a3b8", textAlign: "center" }}>
            <p>
              Desde tu perfil de <strong>Owner</strong> vas a poder habilitar o
              deshabilitar estas herramientas.
            </p>
          </div>
        </aside>

        {/* Área Principal de Chat */}
        <section className="ivot-main-area">
          <header className="ivot-main-header">
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="ivot-chat__avatar-container">
                <img src={ivoLogo} alt="Ivo-t" className="ivot-chat__avatar-img" />
                <span className="ivot-chat__status-dot"></span>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{selectedTool.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>En línea</div>
              </div>
            </div>

            <div style={{ fontSize: "0.8rem", color: "#94a3b8", maxWidth: "300px", textAlign: "right" }}>
              Conectado a Inmovia Brain v1.0
            </div>
          </header>

          {/* Conversación */}
          <div className="ivot-chat__body" style={{ background: "transparent" }}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`ivot-message ${m.from === "yo" ? "ivot-message--user" : "ivot-message--bot"
                  }`}
              >
                <div className="ivot-message__bubble">
                  {m.text}
                </div>
                <div className="ivot-message__time">{m.time}</div>
              </div>
            ))}
            {isLoading && (
              <div className="ivot-message ivot-message--bot">
                <div className="ivot-message__bubble">
                  <em>Ivo-t está escribiendo...</em>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="ivot-chat__input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="ivot-chat__input-field"
              placeholder={`Escribí tu consulta para ${selectedTool.name}...`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="ivot-chat__send-btn" disabled={isLoading}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
