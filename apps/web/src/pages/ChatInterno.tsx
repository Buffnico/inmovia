// apps/web/src/pages/ChatInterno.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../store/auth";
import { NewChatModal, NewGroupModal, BroadcastModal } from "../components/ChatModals";
import "./ChatInterno.css";

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

type User = {
  id: string;
  name: string;
  role: string;
  avatarColor?: string;
};

type Attachment = {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  attachments?: Attachment[];
};

type Conversation = {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  displayName?: string;
  participants: string[];
  participantsDetails: User[];
  lastMessage?: Message;
  unreadCount?: number;
};

export default function ChatInterno() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Modals state
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // UI State
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const isEncargado = user && ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'].includes(user.role?.toUpperCase());

  const emojis = ["👍", "👋", "😊", "😂", "❤️", "🎉", "🔥", "🤔", "😢", "👀", "🙌", "🚀", "💼", "🏠", "✅", "❌"];

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
    fetchUsers();

    const interval = setInterval(() => {
      fetchConversations();
      if (activeConvoId) fetchMessages(activeConvoId);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeConvoId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConvoId) {
      fetchMessages(activeConvoId);
      setMobileView('chat');
      setShowEmojiPicker(false);
    } else {
      setMobileView('list');
    }
  }, [activeConvoId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (convoId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${convoId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.ok) {
        setUsers(data.data.filter((u: any) => u.id !== user?.id));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!draft.trim() && files.length === 0) || !activeConvoId) return;

    const formData = new FormData();
    formData.append('text', draft);
    files.forEach(f => formData.append('files', f));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/conversations/${activeConvoId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setDraft("");
        setFiles([]);
        setShowEmojiPicker(false);
        fetchMessages(activeConvoId);
        fetchConversations();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar mensaje");
    }
  };

  const handleCreateChat = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.ok) {
        setShowNewChat(false);
        setShowNewGroup(false);
        fetchConversations();
        setActiveConvoId(result.data.id);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error al crear chat");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async (data: any) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.ok) {
        setShowBroadcast(false);
        alert(result.message);
        fetchConversations();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error enviando broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (attId: string, convoId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/chat/attachments/${attId}?conversationId=${convoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Error al descargar archivo");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión");
    }
  };

  const addEmoji = (emoji: string) => {
    setDraft(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredConversations = conversations.filter(c => {
    const term = searchTerm.toLowerCase();
    return (c.displayName || c.name || '').toLowerCase().includes(term);
  });

  return (
    <div className="page chat-page">
      <div className="chat-container">
        {/* SIDEBAR */}
        <aside className={`chat-sidebar ${mobileView === 'chat' ? 'd-none d-md-flex' : 'd-flex'}`}>
          <div className="chat-sidebar-header">
            <div className="chat-actions">
              <button className="btn btn-primary btn-sm btn-pill" onClick={() => setShowNewChat(true)}>+ Chat</button>
              {isEncargado && (
                <>
                  <button className="btn btn-outline-primary btn-sm btn-pill" onClick={() => setShowNewGroup(true)}>👥 Grupo</button>
                  <button className="btn btn-outline-primary btn-sm btn-pill" onClick={() => setShowBroadcast(true)}>📢 Masivo</button>
                </>
              )}
            </div>
            <div className="chat-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre o grupo..."
                className="chat-search-input"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="chat-conversation-list">
            {filteredConversations.map(c => (
              <ConversationItem
                key={c.id}
                convo={c}
                active={activeConvoId === c.id}
                onClick={() => setActiveConvoId(c.id)}
                currentUserId={user?.id}
              />
            ))}
            {filteredConversations.length === 0 && (
              <div className="chat-empty-list">
                <div className="empty-icon">💬</div>
                <p>No se encontraron conversaciones.</p>
                <button className="btn-link" onClick={() => setShowNewChat(true)}>Iniciar nueva</button>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN AREA */}
        <section className={`chat-main-area ${mobileView === 'list' ? 'd-none d-md-flex' : 'd-flex'}`}>
          {activeConvo ? (
            <>
              <header className="chat-header">
                <div className="chat-header-info">
                  <button className="btn-icon d-md-none back-btn" onClick={() => setMobileView('list')}>←</button>

                  <div className="chat-avatar-large" style={{ background: '#3b82f6' }}>
                    {activeConvo.type === 'group' ? '👥' : (activeConvo.displayName?.charAt(0) || activeConvo.name?.charAt(0) || '?')}
                  </div>

                  <div className="chat-header-text">
                    <h2 className="chat-title">
                      {activeConvo.displayName || activeConvo.name}
                    </h2>
                    <span className="chat-subtitle">
                      {activeConvo.type === 'group'
                        ? `Grupo • ${activeConvo.participants.length} participantes`
                        : 'Chat Directo'}
                    </span>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <button className="btn-icon" title="Info">ℹ️</button>
                </div>
              </header>

              <div className="chat-messages-list">
                {messages.length === 0 ? (
                  <div className="chat-empty-state">
                    <div className="empty-icon-large">👋</div>
                    <h3>Comienza la charla</h3>
                    <p>Envía un mensaje para iniciar la conversación.</p>
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const prevMsg = messages[idx - 1];
                    const showDate = !prevMsg || new Date(m.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                    return (
                      <React.Fragment key={m.id}>
                        {showDate && (
                          <div className="chat-date-separator">
                            <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <MessageBubble
                          msg={m}
                          isMe={m.senderId === user?.id}
                          onDownload={handleDownload}
                          senderName={activeConvo.type === 'group' && m.senderId !== user?.id
                            ? activeConvo.participantsDetails.find(p => p.id === m.senderId)?.name
                            : undefined}
                        />
                      </React.Fragment>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-composer">
                {files.length > 0 && (
                  <div className="composer-files">
                    {files.map((f, i) => (
                      <div key={i} className="file-pill">
                        <span>📄 {f.name}</span>
                        <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                {showEmojiPicker && (
                  <div className="emoji-picker-popover">
                    {emojis.map(e => (
                      <button key={e} onClick={() => addEmoji(e)}>{e}</button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="composer-form">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files) setFiles(Array.from(e.target.files));
                    }}
                    multiple
                  />
                  <button type="button" className="btn-icon" title="Adjuntar" onClick={() => fileInputRef.current?.click()}>📎</button>

                  <input
                    type="text"
                    className="composer-input"
                    placeholder="Escribe un mensaje..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />

                  <button type="button" className="btn-icon" title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>🙂</button>

                  <button
                    type="submit"
                    className="btn-send"
                    disabled={!draft.trim() && files.length === 0}
                  >
                    ➤
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="chat-welcome-state">
              <div className="welcome-icon">💬</div>
              <h2>Bienvenido al Chat Interno</h2>
              <p>Selecciona una conversación o crea un nuevo chat para comenzar.</p>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <NewChatModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
        users={users}
        onSubmit={handleCreateChat}
        isLoading={isLoading}
      />
      <NewGroupModal
        isOpen={showNewGroup}
        onClose={() => setShowNewGroup(false)}
        users={users}
        onSubmit={handleCreateChat}
        isLoading={isLoading}
      />
      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        users={users}
        onSubmit={handleBroadcast}
        isLoading={isLoading}
      />
    </div>
  );
}

function ConversationItem({ convo, active, onClick, currentUserId }: { convo: Conversation, active: boolean, onClick: () => void, currentUserId?: string }) {
  const lastMsg = convo.lastMessage;
  const time = lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const isGroup = convo.type === 'group';

  return (
    <div
      onClick={onClick}
      className={`chat-conversation-item ${active ? 'active' : ''}`}
    >
      <div className="conversation-avatar">
        {isGroup ? '👥' : (convo.displayName?.charAt(0) || convo.name?.charAt(0) || '?')}
      </div>

      <div className="conversation-info">
        <div className="conversation-header">
          <span className="conversation-name">
            {convo.displayName || convo.name}
          </span>
          <span className="conversation-time">{time}</span>
        </div>
        <div className="conversation-snippet">
          {lastMsg ? (
            <span>{lastMsg.senderId === currentUserId ? 'Tú: ' : ''}{lastMsg.text || '📎 Adjunto'}</span>
          ) : (
            <span className="text-italic">Nueva conversación</span>
          )}
          {convo.unreadCount ? <span className="unread-dot">●</span> : null}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isMe, onDownload, senderName }: { msg: Message, isMe: boolean, onDownload: (attId: string, convoId: string, fileName: string) => void, senderName?: string }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`chat-message-row ${isMe ? 'mine' : 'other'}`}>
      <div className="chat-bubble">
        {senderName && <div className="bubble-sender">{senderName}</div>}

        {msg.text && <div className="bubble-text">{msg.text}</div>}

        {msg.attachments && msg.attachments.length > 0 && (
          <div className="bubble-attachments">
            {msg.attachments.map(att => (
              <div key={att.id} className="attachment-card">
                <span className="att-icon">📄</span>
                <div className="att-info">
                  <span className="att-name">{att.fileName}</span>
                  <button
                    className="att-download"
                    onClick={(e) => {
                      e.preventDefault();
                      onDownload(att.id, msg.conversationId, att.fileName);
                    }}
                  >
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bubble-time">
          {time}
        </div>
      </div>
    </div>
  );
}
