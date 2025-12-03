import React, { useState, useEffect, useRef } from 'react';
import { InstagramAccount, getInboxThreads, getThreadMessages, sendDmMessage, IgThread, IgMessage } from '../services/instagramService';

interface Props {
    account: InstagramAccount;
}

export default function RedesInstagramMensajes({ account }: Props) {
    const [threads, setThreads] = useState<IgThread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [messages, setMessages] = useState<IgMessage[]>([]);
    const [inputText, setInputText] = useState("");
    const [loadingThreads, setLoadingThreads] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [mobileChatActive, setMobileChatActive] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadThreads();
    }, [account.id]);

    useEffect(() => {
        if (selectedThreadId) {
            loadMessages(selectedThreadId);
            setMobileChatActive(true);
        } else {
            setMessages([]);
            setMobileChatActive(false);
        }
    }, [selectedThreadId]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadThreads = async () => {
        setLoadingThreads(true);
        try {
            const data = await getInboxThreads(account.id);
            setThreads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingThreads(false);
        }
    };

    const loadMessages = async (threadId: string) => {
        setLoadingMessages(true);
        try {
            const data = await getThreadMessages(account.id, threadId);
            setMessages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async (e: React.FormEvent | React.KeyboardEvent) => {
        e.preventDefault();
        if (!selectedThreadId || !inputText.trim()) return;

        try {
            const newMsg = await sendDmMessage(account.id, selectedThreadId, inputText);
            setMessages([...messages, newMsg]);
            setInputText("");
        } catch (error) {
            console.error(error);
            alert("Error al enviar mensaje");
        }
    };

    const handleIvoSuggest = () => {
        setInputText("Hola, ¿en qué puedo ayudarte hoy? 🤖");
    };

    const handleBackToList = () => {
        setMobileChatActive(false);
        setSelectedThreadId(null);
    };

    const selectedThread = threads.find(t => t.id === selectedThreadId);

    return (
        <div className={`dm-layout ${mobileChatActive ? 'mobile-chat-active' : ''}`}>
            {/* Sidebar: Threads List */}
            <div className="dm-sidebar">
                <div className="redes-panel-header py-3 px-3 border-bottom">
                    <div className="d-flex align-items-center justify-content-center w-100 position-relative">
                        <span className="fw-bold">{account.igUsername}</span>
                        <span className="ms-1">▾</span>
                        <button className="btn btn-link p-0 position-absolute end-0 text-dark" style={{ fontSize: '1.2rem' }}>✏️</button>
                    </div>
                </div>

                <div className="p-2 border-bottom">
                    <input type="text" className="form-control form-control-sm bg-light border-0" placeholder="Buscar..." style={{ borderRadius: '8px' }} />
                </div>

                <div className="flex-grow-1 overflow-auto">
                    {loadingThreads ? (
                        <div className="p-4 text-center text-muted small">Cargando chats...</div>
                    ) : (
                        threads.map(thread => (
                            <div
                                key={thread.id}
                                className={`dm-thread-item ${selectedThreadId === thread.id ? 'active' : ''}`}
                                onClick={() => setSelectedThreadId(thread.id)}
                            >
                                <div className="position-relative">
                                    <img
                                        src={thread.participants[0]?.profilePic || 'https://via.placeholder.com/56'}
                                        className="dm-avatar"
                                        alt="Avatar"
                                    />
                                    {/* Online indicator mock */}
                                    <div className="position-absolute bottom-0 end-0 bg-success border border-white rounded-circle" style={{ width: 14, height: 14, marginRight: 2, marginBottom: 2 }}></div>
                                </div>
                                <div className="dm-info">
                                    <div className="dm-name">{thread.participants[0]?.name || 'Usuario'}</div>
                                    <div className="d-flex align-items-center">
                                        <div className={`dm-preview ${thread.unreadCount > 0 ? 'fw-bold text-dark' : ''}`}>
                                            {thread.lastMessagePreview}
                                        </div>
                                        <span className="mx-1 text-muted small">·</span>
                                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                            {new Date(thread.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                        {thread.unreadCount > 0 && <div className="bg-primary rounded-circle ms-2" style={{ width: 8, height: 8 }}></div>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className="dm-chat-area">
                {selectedThreadId ? (
                    <>
                        {/* Demo Banner */}
                        <div className="dm-demo-banner">
                            Demo – Esta vista muestra cómo se gestionarán los mensajes directos. En producción se conectará a la API de Meta.
                        </div>

                        {/* Chat Header */}
                        <div className="redes-panel-header py-2 px-3 bg-white" style={{ height: '60px' }}>
                            <button className="btn btn-sm btn-light d-md-none me-2" onClick={handleBackToList}>←</button>
                            <img
                                src={selectedThread?.participants[0]?.profilePic || 'https://via.placeholder.com/24'}
                                className="rounded-circle me-2"
                                style={{ width: 24, height: 24 }}
                                alt="Avatar"
                            />
                            <div className="d-flex flex-column justify-content-center">
                                <span className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{selectedThread?.participants[0]?.name}</span>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>Activo ahora</span>
                            </div>
                            <div className="ms-auto d-flex gap-3 text-dark" style={{ fontSize: '1.2rem' }}>
                                <span style={{ cursor: 'pointer' }}>📞</span>
                                <span style={{ cursor: 'pointer' }}>📹</span>
                                <span style={{ cursor: 'pointer' }}>ℹ️</span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="dm-messages">
                            {loadingMessages ? (
                                <div className="text-center p-4 text-muted">Cargando mensajes...</div>
                            ) : (
                                <>
                                    <div className="text-center my-4">
                                        <img
                                            src={selectedThread?.participants[0]?.profilePic || 'https://via.placeholder.com/80'}
                                            className="rounded-circle mb-2"
                                            style={{ width: 80, height: 80, objectFit: 'cover' }}
                                            alt=""
                                        />
                                        <h5 className="fw-bold">{selectedThread?.participants[0]?.name}</h5>
                                        <p className="text-muted small">Instagram · {selectedThread?.participants[0]?.username}</p>
                                        <button className="btn btn-sm btn-light border">Ver perfil</button>
                                    </div>

                                    {messages.map(msg => (
                                        <div key={msg.id} className={`d-flex flex-column ${msg.fromSelf ? 'align-items-end' : 'align-items-start'}`}>
                                            <div className={`dm-bubble ${msg.fromSelf ? 'sent' : 'received'}`}>
                                                {msg.text}
                                            </div>
                                            <div className="text-muted small mt-1" style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Composer */}
                        <div className="p-3 bg-white border-top">
                            {account.ivoSettings?.suggestMode && (
                                <div className="mb-2">
                                    <button className="btn btn-sm text-white rounded-pill px-3 d-inline-flex align-items-center gap-2 shadow-sm" onClick={handleIvoSuggest} type="button" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}>
                                        <span>✨</span> Sugerir respuesta con Ivo-t
                                    </button>
                                </div>
                            )}

                            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 border">
                                <button className="btn btn-link text-dark p-0 text-decoration-none" style={{ fontSize: '1.5rem' }}>🙂</button>
                                <input
                                    type="text"
                                    className="form-control border-0 bg-transparent shadow-none"
                                    placeholder="Envía un mensaje..."
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend(e)}
                                />
                                {inputText.trim() ? (
                                    <button className="btn btn-link text-primary fw-bold p-0 text-decoration-none" onClick={handleSend}>Enviar</button>
                                ) : (
                                    <>
                                        <button className="btn btn-link text-dark p-0 text-decoration-none" style={{ fontSize: '1.2rem' }}>🖼️</button>
                                        <button className="btn btn-link text-dark p-0 text-decoration-none" style={{ fontSize: '1.2rem' }}>❤️</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                        <div className="mb-3 p-4 rounded-circle border border-2 border-dark d-flex align-items-center justify-content-center" style={{ width: 100, height: 100 }}>
                            <span style={{ fontSize: '3rem' }}>⚡</span>
                        </div>
                        <h4 className="fw-light">Tus mensajes</h4>
                        <p className="text-muted">Envía fotos y mensajes privados a amigos o grupos.</p>
                        <button className="btn btn-primary btn-sm px-3">Enviar mensaje</button>
                    </div>
                )}
            </div>
        </div>
    );
}
