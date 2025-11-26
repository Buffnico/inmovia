// apps/web/src/pages/ChatInterno.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ChatInterno.css";

type UserStatus = "online" | "offline" | "busy";

type ChatUser = {
  id: string;
  name: string;
  role: string;
  status: UserStatus;
  unread?: number;
  avatarColor?: string;
};

type Message = {
  id: string;
  from: "yo" | "otro";
  text: string;
  time: string;
};

const DUMMY_USERS: ChatUser[] = [
  { id: "broker", name: "Martín (Broker)", role: "Broker / Dueño", status: "online", avatarColor: "#2563eb" },
  { id: "martillero", name: "Laura (Martillera)", role: "Martillero Público", status: "offline", avatarColor: "#7c3aed" },
  { id: "admin", name: "Soporte Admin", role: "Administración", status: "online", unread: 3, avatarColor: "#db2777" },
  { id: "agente1", name: "Juan Pérez", role: "Agente", status: "online", avatarColor: "#059669" },
  { id: "agente2", name: "Sofía G.", role: "Agente", status: "busy", avatarColor: "#d97706" },
  { id: "agente3", name: "Carlos M.", role: "Agente", status: "offline", avatarColor: "#4b5563" },
];

const DUMMY_MESSAGES: Record<string, Message[]> = {
  broker: [
    { id: "m1", from: "otro", text: "Hola, necesito ver los números de cierre de mes.", time: "09:12" },
    { id: "m2", from: "yo", text: "En un momento te los paso.", time: "09:15" },
  ],
  admin: [
    { id: "m3", from: "otro", text: "Falta firmar la reserva de Alsina.", time: "11:00" },
    { id: "m4", from: "otro", text: "¿Podés pasar por la oficina?", time: "11:01" },
  ],
};

export default function ChatInterno() {
  const [selectedUserId, setSelectedUserId] = useState<string>("broker");
  const [messagesByUser, setMessagesByUser] = useState<Record<string, Message[]>>(DUMMY_MESSAGES);
  const [draft, setDraft] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUser = DUMMY_USERS.find((u) => u.id === selectedUserId) ?? DUMMY_USERS[0];
  const messages = messagesByUser[selectedUserId] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedUserId]);

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

    setMessagesByUser((prev) => ({
      ...prev,
      [selectedUserId]: [...(prev[selectedUserId] ?? []), newMsg],
    }));
    setDraft("");
  }

  return (
    <div className="page chat-page">
      {/* Header de la sección */}
      <div className="page-header">
        <h1 className="page-title">Chat de Oficina</h1>
        <p className="page-subtitle">Conectado con el equipo Inmovia.</p>
      </div>

      <div className="chat-container">
        {/* SIDEBAR DE USUARIOS (IZQUIERDA) */}
        <aside className="chat-sidebar">
          <div className="chat-search-container">
            <input
              type="text"
              placeholder="Buscar compañero..."
              className="chat-search-input"
            />
          </div>

          <div className="chat-users-list">
            <div className="chat-users-section-title">
              Usuarios
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {DUMMY_USERS.map(u => (
                <UserListItem
                  key={u.id}
                  user={u}
                  active={selectedUserId === u.id}
                  onClick={() => setSelectedUserId(u.id)}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* ÁREA DE CHAT (DERECHA) */}
        <section className="chat-main-area">
          {/* Header del Chat Activo */}
          <header className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="chat-avatar-wrapper">
                <div className="chat-avatar" style={{ background: activeUser.avatarColor || '#cbd5e1' }}>
                  {activeUser.name.charAt(0)}
                </div>
                <div className="chat-status-dot" style={{
                  background: activeUser.status === 'online' ? '#22c55e' : (activeUser.status === 'busy' ? '#f59e0b' : '#94a3b8')
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{activeUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{activeUser.role}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-icon" title="Llamar">📞</button>
              <button className="btn-icon" title="Video">📹</button>
              <button className="btn-icon" title="Info">ℹ️</button>
            </div>
          </header>

          {/* Lista de Mensajes */}
          <div className="chat-messages-list">
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.6 }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem', filter: 'grayscale(1)' }}>👋</div>
                <p>Inicia la conversación con {activeUser.name.split(' ')[0]}.</p>
              </div>
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} msg={m} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area">
            <form onSubmit={handleSend} className="chat-input-form">
              <button type="button" className="btn-icon-small" title="Adjuntar">📎</button>

              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.95rem',
                  color: '#0f172a',
                  padding: '0.25rem'
                }}
              />

              <button
                type="submit"
                disabled={!draft.trim()}
                style={{
                  background: draft.trim() ? 'var(--inmovia-primary)' : '#cbd5e1',
                  color: 'white',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: draft.trim() ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
              >
                ➤
              </button>
            </form>
          </div>

        </section>
      </div>
    </div>
  );
}

function UserListItem({ user, active, onClick }: { user: ChatUser, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`chat-user-item ${active ? 'active' : ''}`}
    >
      <div className="chat-avatar-wrapper">
        <div className="chat-avatar" style={{ background: user.avatarColor || '#cbd5e1' }}>
          {user.name.charAt(0)}
        </div>
        <div className="chat-status-dot" style={{
          background: user.status === 'online' ? '#22c55e' : (user.status === 'busy' ? '#f59e0b' : '#94a3b8')
        }} />
      </div>

      <div className="chat-user-info">
        <div className="chat-user-name" style={{ fontWeight: active || user.unread ? 700 : 500 }}>
          {user.name}
        </div>
        <div className="chat-user-role">
          {user.role}
        </div>
      </div>

      {user.unread ? (
        <div className="chat-unread-badge">
          {user.unread}
        </div>
      ) : null}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.from === "yo";
  return (
    <div className="chat-bubble-container" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
      <div className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-other'}`}>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</div>
        <div className="chat-bubble-time" style={{ color: isMe ? '#e0e7ff' : '#94a3b8' }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}
