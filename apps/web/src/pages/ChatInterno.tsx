// apps/web/src/pages/ChatInterno.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header de la sección */}
      <div className="page-header">
        <h1 className="page-title">Chat de Oficina</h1>
        <p className="page-subtitle">Conectado con el equipo Inmovia.</p>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', minHeight: 0 }}>

        {/* SIDEBAR DE USUARIOS (IZQUIERDA) */}
        <aside style={{
          width: '300px',
          borderRight: '1px solid var(--inmovia-border-soft)',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '1.25rem 1rem 1rem' }}>
            <input
              type="text"
              placeholder="Buscar compañero..."
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '99px',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 1rem' }}>

            <div style={{ padding: '0.5rem 0.5rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>

          {/* Header del Chat Activo */}
          <header style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--inmovia-border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: activeUser.avatarColor || '#cbd5e1',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', fontWeight: 600
                }}>
                  {activeUser.name.charAt(0)}
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '12px', height: '12px', borderRadius: '50%',
                  border: '2px solid white',
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
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            background: '#f8fafc'
          }}>
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
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--inmovia-border-soft)',
            background: 'white'
          }}>
            <form
              onSubmit={handleSend}
              style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                background: '#f1f5f9',
                padding: '0.5rem',
                borderRadius: '1.5rem',
                border: '1px solid transparent',
                transition: 'border-color 0.2s',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
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

      <style>{`
        .btn-icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          display: flex; alignItems: 'center'; justifyContent: 'center';
          font-size: 1.1rem;
          transition: all 0.2s;
        }
        .btn-icon:hover { background: #f1f5f9; color: #0f172a; }

        .btn-icon-small {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s;
        }
        .btn-icon-small:hover { background: #e2e8f0; color: #0f172a; }
      `}</style>
    </div>
  );
}

function UserListItem({ user, active, onClick }: { user: ChatUser, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '0.75rem 0.75rem',
        borderRadius: '0.75rem',
        border: 'none',
        background: active ? 'white' : 'transparent',
        boxShadow: active ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => !active && (e.currentTarget.style.background = '#f1f5f9')}
      onMouseLeave={(e) => !active && (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: user.avatarColor || '#cbd5e1',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.9rem', fontWeight: 600
        }}>
          {user.name.charAt(0)}
        </div>
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '10px', height: '10px', borderRadius: '50%',
          border: '2px solid white', // o el color de fondo del padre
          background: user.status === 'online' ? '#22c55e' : (user.status === 'busy' ? '#f59e0b' : '#94a3b8')
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: active || user.unread ? 700 : 500,
          color: '#0f172a',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {user.name}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#64748b',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {user.role}
        </div>
      </div>

      {user.unread ? (
        <div style={{
          background: '#ef4444', color: 'white',
          fontSize: '0.7rem', fontWeight: 700,
          padding: '2px 6px', borderRadius: '99px'
        }}>
          {user.unread}
        </div>
      ) : null}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isMe = msg.from === "yo";
  return (
    <div style={{
      display: 'flex',
      justifyContent: isMe ? 'flex-end' : 'flex-start',
      marginBottom: '0.25rem'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '0.75rem 1rem',
        borderRadius: '1.25rem',
        borderBottomRightRadius: isMe ? '4px' : '1.25rem',
        borderBottomLeftRadius: isMe ? '1.25rem' : '4px',
        background: isMe ? 'linear-gradient(135deg, #2563eb, #4f46e5)' : 'white',
        color: isMe ? 'white' : '#0f172a',
        boxShadow: isMe ? '0 4px 12px rgba(37, 99, 235, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)',
        border: isMe ? 'none' : '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{msg.text}</div>
        <div style={{
          fontSize: '0.7rem',
          marginTop: '0.25rem',
          textAlign: 'right',
          opacity: 0.8,
          color: isMe ? '#e0e7ff' : '#94a3b8'
        }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}
