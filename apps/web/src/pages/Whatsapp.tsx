// apps/web/src/pages/Whatsapp.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

type WhatsappChat = {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  tag?: string;
};

type WMessage = {
  id: string;
  from: "cliente" | "agente" | "ia";
  text: string;
  time: string;
};

type Mode = "manual" | "assist" | "auto";

const DUMMY_W_CHATS: WhatsappChat[] = [
  { id: "c1", name: "Juan Pérez", phone: "+54 9 11 2345-6789", lastMessage: "¿Podemos ver la propiedad mañana?", tag: "Compra" },
  { id: "c2", name: "María López", phone: "+54 9 11 9876-5432", lastMessage: "Recibí la reserva, gracias.", tag: "Alquiler" },
];

const DUMMY_W_MESSAGES: Record<string, WMessage[]> = {
  c1: [
    { id: "w1", from: "cliente", text: "Hola, me interesa el depto en Banfield.", time: "10:05" },
    { id: "w2", from: "agente", text: "Hola Juan, gracias por escribir. ¿Qué día te queda cómodo para visitarlo?", time: "10:10" },
  ],
  c2: [
    { id: "w3", from: "cliente", text: "Confirmo que hice la transferencia.", time: "14:22" },
    { id: "w4", from: "agente", text: "Perfecto, ya registramos tu reserva.", time: "14:30" },
  ],
};

export default function Whatsapp() {
  const [selectedChatId, setSelectedChatId] = useState<string>("c1");
  const [mode, setMode] = useState<Mode>("assist");
  const [messagesByChat] = useState<Record<string, WMessage[]>>(DUMMY_W_MESSAGES);
  const [draft, setDraft] = useState<string>("");

  const chat = DUMMY_W_CHATS.find((c) => c.id === selectedChatId) ?? DUMMY_W_CHATS[0];
  const messages = messagesByChat[selectedChatId] ?? [];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    alert(
      `Modo actual: ${
        mode === "manual" ? "Manual" : mode === "assist" ? "Ivo-t sugiere respuesta" : "Ivo-t responde automático"
      }.\n\nEn la versión real, este mensaje iría a la API de WhatsApp Business.`
    );
  }

  return (
    <div className="app-shell">
      {/* /<Sidebar />/ */}

      <div className="app-main app-whatsapp">
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
            <h1 className="brand-title">WhatsApp</h1>
            <p className="brand-sub">
              Centralizá las conversaciones de WhatsApp de la oficina y usá Ivo-t para responder más rápido.
            </p>
          </div>

          {/* Aviso técnico corto */}
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(141,197,255,0.35)",
              background: "rgba(10,24,50,0.85)",
              fontSize: 13,
            }}
          >
            <strong>Nota:</strong> Esta sección se conectará a la API oficial de WhatsApp Business (Meta). Esta es una maqueta.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "320px 1fr",
              gap: 16,
              minHeight: "60vh",
            }}
          >
            {/* Lista de chats */}
            <aside
              style={{
                borderRadius: 16,
                padding: 12,
                background: "rgba(15,30,55,0.9)",
                border: "1px solid rgba(141,197,255,0.25)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Conversaciones WhatsApp</div>
              {DUMMY_W_CHATS.map((c) => {
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
                      background: active ? "rgba(55,168,255,0.14)" : "rgba(10,24,50,0.9)",
                      borderColor: active ? "rgba(55,168,255,0.35)" : "rgba(23,48,79,0.9)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{c.phone}</span>
                    <span style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{c.lastMessage}</span>
                    {c.tag && (
                      <span
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          padding: "2px 6px",
                          borderRadius: 999,
                          border: "1px solid rgba(55,168,255,0.4)",
                          background: "rgba(55,168,255,0.08)",
                        }}
                      >
                        {c.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </aside>

            {/* Panel conversación + modo IA */}
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
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{chat.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{chat.phone}</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Modo de respuesta</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setMode("manual")}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        borderColor: mode === "manual" ? "rgba(255,255,255,0.65)" : "rgba(23,48,79,0.9)",
                        background: mode === "manual" ? "rgba(255,255,255,0.06)" : "rgba(10,24,50,0.9)",
                      }}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setMode("assist")}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        borderColor: mode === "assist" ? "rgba(42,168,255,0.75)" : "rgba(23,48,79,0.9)",
                        background: mode === "assist" ? "rgba(42,168,255,0.16)" : "rgba(10,24,50,0.9)",
                      }}
                    >
                      Ivo-t sugiere
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setMode("auto")}
                      style={{
                        padding: "4px 8px",
                        fontSize: 12,
                        borderColor: mode === "auto" ? "rgba(42,168,255,0.85)" : "rgba(23,48,79,0.9)",
                        background: mode === "auto" ? "rgba(42,168,255,0.22)" : "rgba(10,24,50,0.9)",
                      }}
                    >
                      Ivo-t automático
                    </button>
                  </div>
                </div>
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
                {messages.map((m) => {
                  const isAgent = m.from === "agente" || m.from === "ia";
                  const label = m.from === "cliente" ? "" : m.from === "ia" ? "Ivo-t" : "Vos";
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isAgent ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "8px 12px",
                          borderRadius: 14,
                          fontSize: 14,
                          background: isAgent
                            ? "linear-gradient(135deg,#25D366,#128C7E)"
                            : "rgba(18,36,63,0.9)",
                          color: isAgent ? "#fff" : "#eaf3ff",
                          border: isAgent ? "1px solid rgba(37,211,102,0.7)" : "1px solid rgba(141,197,255,0.18)",
                        }}
                      >
                        {label && <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>{label}</div>}
                        <div>{m.text}</div>
                        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.7, textAlign: "right" }}>{m.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input envío (maqueta) */}
              <form onSubmit={handleSend} style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Escribí una respuesta para el cliente..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(141,197,255,0.3)",
                    padding: "8px 14px",
                    background: "rgba(10,24,50,0.95)",
                    color: "#eaf3ff",
                    fontSize: 14,
                  }}
                />
                <button type="submit" className="btn btn-primary">Enviar</button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
