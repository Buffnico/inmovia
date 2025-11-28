import { FormEvent, useState, Suspense, Component, ReactNode, lazy } from "react";
import { Link } from "react-router-dom";
import ivoLogo from "../assets/ivot-logo.png";
import "../pages/IvoT.css";

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
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(INITIAL_MSGS);
  const [draft, setDraft] = useState("");

  function handleSend(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

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

    // Maqueta: Ivo-t responde automáticamente con un mensaje fijo
    const botMsg: Msg = {
      id: `b-${Date.now()}`,
      from: "bot",
      text: "Esta es una demo visual. En la versión real, Ivo-t va a conectarse a la IA y a tu agenda para ayudarte.",
      time: now,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setDraft("");
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
            width: "320px",
            height: "450px",
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
            </div>

            <form className="ivo-chat-input-row" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Escribí tu mensaje..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Enviar
              </button>
            </form>

            <div className="ivo-chat-footer">
              <span>
                Esta es una demo de Ivo-t. Para más opciones, abrí la{" "}
                <Link to="/ivo-t">vista completa</Link>.
              </span>
            </div>
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
