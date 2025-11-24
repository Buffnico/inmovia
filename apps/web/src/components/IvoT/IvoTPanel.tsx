import React, { useState, useEffect, useRef } from "react";
import ivoLogo from "../../assets/ivot-logo.png";

interface IvoTPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type Message = {
    id: string;
    from: "bot" | "user";
    text: string;
    time: string;
};

const INITIAL_MSGS: Message[] = [
    {
        id: "m1",
        from: "bot",
        text: "Hola, soy Ivo-t 👋 ¿En qué te ayudo hoy?",
        time: "09:00",
    },
    {
        id: "m2",
        from: "bot",
        text: "Podés pedirme que agende una visita, busque una propiedad o redacte un correo.",
        time: "09:01",
    },
];

// 🔹 API base: igual que en IvoT.tsx
const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

// 🔹 Endpoint de chat de Ivo-t
const API_URL = `${API_BASE_URL}/ivot/chat`;

export const IvoTPanel: React.FC<IvoTPanelProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MSGS);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const now = new Date().toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const userMsg: Message = {
            id: `u-${Date.now()}`,
            from: "user",
            text: inputValue,
            time: now,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Preparar historial para OpenAI
            const history = messages.concat(userMsg).map((m) => ({
                role: m.from === "user" ? "user" : "assistant",
                content: m.text,
            }));

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ history }),
            });

            if (!response.ok) throw new Error("Error en la respuesta");

            const data = await response.json();

            const botMsg: Message = {
                id: `b-${Date.now()}`,
                from: "bot",
                text: data.message,
                time: new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (error) {
            console.error("Error al comunicarse con Ivo-t:", error);
            const errorMsg: Message = {
                id: `e-${Date.now()}`,
                from: "bot",
                text:
                    "Lo siento, hubo un problema al comunicarme con el servidor de Inmovia. Probá nuevamente en unos instantes.",
                time: new Date().toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="ivot-chat">
            <div className="ivot-chat__panel glass-panel-premium">
                {/* Header */}
                <header className="ivot-chat__header">
                    <div className="ivot-chat__header-left">
                        <div className="ivot-chat__avatar-container">
                            <img src={ivoLogo} alt="Ivo-t" className="ivot-chat__avatar-img" />
                            <span className="ivot-chat__status-dot"></span>
                        </div>
                        <div>
                            <div className="ivot-chat__title">Ivo-t</div>
                            <div className="ivot-chat__subtitle">Asistente IA</div>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="ivot-chat__close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>
                </header>

                {/* Body */}
                <div className="ivot-chat__body">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`ivot-message ${msg.from === "user" ? "ivot-message--user" : "ivot-message--bot"
                                }`}
                        >
                            <div className="ivot-message__bubble">{msg.text}</div>
                            <div className="ivot-message__time">{msg.time}</div>
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
                        placeholder="Escribí tu mensaje..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="ivot-chat__send-btn"
                        disabled={isLoading}
                    >
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
            </div>
        </div>
    );
};
