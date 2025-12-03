import { FormEvent, useState, Suspense, Component, ReactNode, lazy, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import ivoLogo from "../assets/ivot-logo.png";
import "../pages/IvoT.css";
import { IvoChatService, loadIvoHistory, saveIvoHistory } from "../services/ivoChatService";
import { useAuth } from "../store/auth";

// Lazy load the 3D component to isolate Three.js dependencies
const IvoT3D = lazy(() => import("./IvoT3D"));

type Msg = {
  id: string;
  from: "bot" | "user";
  text: string;
  time: string;
};

const INITIAL_MSGS: Msg[] = [
  {
    id: "m1",
    from: "bot",
    text: "Hola, soy Ivo-t 👋 ¿En qué te ayudo?",
    time: "09:00",
  },
  {
    id: "m2",
    from: "bot",
    text: "Podés preguntarme por documentos, propiedades o pedirme que agende una visita.",
    time: "09:01",
  },
];

// Error Boundary to catch 3D loading errors
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("IvoT 3D Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100%', height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red', fontSize: '8px', textAlign: 'center', overflow: 'auto', padding: '4px' }}>
          {this.state.error?.message || "Unknown Error"}
        </div>
      );
    }
    return this.props.children;
  }
}

export default function IvoTFab() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]); // Start empty
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load History
  useEffect(() => {
    if (user?.id) {
      const history = loadIvoHistory(user.id, "fab");
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        setMessages(INITIAL_MSGS);
      }
    }
  }, [user?.id]);

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;

    const now = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg: Msg = {
      id: `u-${Date.now()}`,
      from: "user",
      text,
      time: now,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (user?.id) saveIvoHistory(user.id, "fab", newMessages);
    setDraft("");
    setIsLoading(true);

    // Keep focus on input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    try {
      const history = messages.concat(userMsg).map((m) => ({
        role: m.from === "user" ? "user" : "assistant",
        content: m.text,
      })) as { role: "user" | "assistant"; content: string }[];

      const responseMessage = await IvoChatService.sendMessage(history);

      const botMsg: Msg = {
        id: `b-${Date.now()}`,
        from: "bot",
        text: responseMessage,
        time: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const updatedMessages = [...newMessages, botMsg];
      setMessages(updatedMessages);
      if (user?.id) saveIvoHistory(user.id, "fab", updatedMessages);
    } catch (error) {
      console.error("Error al comunicarse con Ivo-t:", error);
      const errorMsg: Msg = {
        id: `e-${Date.now()}`,
        from: "bot",
        text: "Hubo un problema al conectar con Ivo-t. Intentá de nuevo.",
        time: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => {
        const updated = [...prev, errorMsg];
        if (user?.id) saveIvoHistory(user.id, "fab", updated);
        return updated;
      });
    } finally {
      setIsLoading(false);
      // Ensure focus is back on input after loading
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }

  const FallbackImage = (
    <img
      src={ivoLogo}
      alt="Ivo-t"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "16px",
        pointerEvents: "none", // Allow clicks to pass through the empty area
      }}
    >
      {/* Panel de chat */}
      {open && (
        <div
          className="ivo-fab-root"
          style={{
            position: "relative", // Override CSS fixed
            bottom: "auto",
            right: "auto",
            width: "420px",
            height: "600px",
            maxWidth: "90vw",
            maxHeight: "80vh",
            pointerEvents: "auto", // Re-enable clicks
            marginBottom: "8px",
          }}
        >
          <header className="ivo-chat-header">
            <div className="ivo-chat-header-left">
              <div className="ivo-chat-avatar">
                <img src={ivoLogo} alt="Ivo-t" />
              </div>
              <div className="ivo-chat-header-text">
                <div className="ivo-chat-title">Ivo-t</div>
                <div className="ivo-chat-subtitle">
                  Asistente IA de Inmovia
                </div>
              </div>
            </div>
            <button
              type="button"
              className="ivo-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar chat de Ivo-t"
            >
              ×
            </button>
          </header>

          <div className="ivo-chat-body">
            <div className="ivo-chat-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    "ivo-chat-msg " +
                    (m.from === "bot" ? "ivo-chat-msg-bot" : "ivo-chat-msg-user")
                  }
                >
                  <div className="ivo-chat-msg-text">{m.text}</div>
                  <div className="ivo-chat-msg-time">{m.time}</div>
                </div>
              ))}
              {isLoading && (
                <div className="ivo-chat-msg ivo-chat-msg-bot">
                  <div className="ivo-chat-msg-text">
                    <em>Ivo-t está escribiendo...</em>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="ivo-chat-input-row" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Escribí tu mensaje..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isLoading}
              />
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón flotante con el icono de Ivo-t (3D Lazy Loaded) */}
      <button
        type="button"
        className="ivo-fab-button-circle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir chat de Ivo-t"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          border: "none",
          padding: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          background: "white",
          cursor: "pointer",
          pointerEvents: "auto", // Re-enable clicks
        }}
      >
        <ErrorBoundary fallback={FallbackImage}>
          <Suspense fallback={FallbackImage}>
            <IvoT3D open={open} />
          </Suspense>
        </ErrorBoundary>
      </button>
    </div>
  );
}
