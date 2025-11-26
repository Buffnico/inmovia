// apps/web/src/pages/Whatsapp.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Whatsapp.css";

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
  { id: "c3", name: "Roberto Diaz", phone: "+54 9 11 1122-3344", lastMessage: "Te paso los documentos.", tag: "Venta" },
];

const DUMMY_W_MESSAGES: Record<string, WMessage[]> = {
  c1: [
    { id: "w1", from: "cliente", text: "Hola, me interesa el depto en Banfield.", time: "10:05" },
    { id: "w2", from: "agente", text: "Hola Juan, gracias por escribir. ¿Qué día te queda cómodo para visitarlo?", time: "10:10" },
    { id: "w3", from: "cliente", text: "Mañana por la tarde estaría bien.", time: "10:15" },
  ],
  c2: [
    { id: "w4", from: "cliente", text: "Confirmo que hice la transferencia.", time: "14:22" },
    { id: "w5", from: "ia", text: "Gracias María. Hemos recibido el comprobante. En breve te contactará un agente.", time: "14:23" },
    { id: "w6", from: "agente", text: "Perfecto, ya registramos tu reserva.", time: "14:30" },
  ],
  c3: [
    { id: "w7", from: "cliente", text: "Te adjunto los planos.", time: "09:00" },
  ],
};

export default function Whatsapp() {
  const [selectedChatId, setSelectedChatId] = useState<string>("c1");
  const [mode, setMode] = useState<Mode>("assist");
  const [messagesByChat, setMessagesByChat] = useState<Record<string, WMessage[]>>(DUMMY_W_MESSAGES);
  const [draft, setDraft] = useState<string>("");

  const chat = DUMMY_W_CHATS.find((c) => c.id === selectedChatId) ?? DUMMY_W_CHATS[0];
  const messages = messagesByChat[selectedChatId] ?? [];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    // Simular envío
    const newMessage: WMessage = {
      id: `w-${Date.now()}`,
      from: "agente",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessagesByChat(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
    }));

    setDraft("");
  }

  return (
    <div className="page">
      <div className="propiedades-layout"> {/* Reusing layout container for width */}

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">WhatsApp Business</h1>
            <p className="text-muted">Gestioná tus conversaciones y potenciá tu respuesta con Ivo-t.</p>
          </div>
          <div className="actions">
            <Link to="/dashboard" className="btn btn-ghost">
              ← Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="whatsapp-layout">

          {/* Sidebar */}
          <aside className="chat-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Chats</h2>
            </div>
            <div className="chat-list">
              {DUMMY_W_CHATS.map((c) => {
                const active = c.id === selectedChatId;
                return (
                  <div
                    key={c.id}
                    className={`chat-item ${active ? 'active' : ''}`}
                    onClick={() => setSelectedChatId(c.id)}
                  >
                    <div className="chat-name">{c.name}</div>
                    <div className="chat-preview">{c.lastMessage}</div>
                    <div className="chat-meta">
                      <span className="chat-phone">{c.phone}</span>
                      {c.tag && <span className="chat-tag">{c.tag}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Chat */}
          <section className="chat-main">
            <header className="chat-header">
              <div className="header-info">
                <h2>{chat.name}</h2>
                <p>{chat.phone}</p>
              </div>

              <div className="mode-toggle">
                <button
                  className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
                  onClick={() => setMode('manual')}
                >
                  Manual
                </button>
                <button
                  className={`mode-btn ${mode === 'assist' ? 'active' : ''}`}
                  onClick={() => setMode('assist')}
                >
                  Ivo-t Sugiere
                </button>
                <button
                  className={`mode-btn ${mode === 'auto' ? 'active' : ''}`}
                  onClick={() => setMode('auto')}
                >
                  Automático
                </button>
              </div>
            </header>

            <div className="chat-messages">
              {messages.map((m) => {
                const label = m.from === "cliente" ? "" : m.from === "ia" ? "Ivo-t" : "Vos";
                return (
                  <div key={m.id} className={`message-bubble ${m.from}`}>
                    {label && <div className="message-label">{label}</div>}
                    <div className="message-text">{m.text}</div>
                    <div className="message-time">{m.time}</div>
                  </div>
                );
              })}
            </div>

            <div className="chat-input-area">
              <form onSubmit={handleSend} className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Escribí un mensaje..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button type="submit" className="btn-send" disabled={!draft.trim()}>
                  ➤
                </button>
              </form>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
