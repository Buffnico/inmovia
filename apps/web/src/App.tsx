// apps/web/src/App.tsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { IvoTPanel } from "./components/IvoT/IvoTPanel";

const App: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "";

  const [isIvoOpen, setIsIvoOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);

  const unreadCount = 3; // mock por ahora

  const isChat = location.pathname === "/chat-interno";

  // Landing sin header ni sidebar
  if (isLanding) {
    return (
      <div className="root-bg">
        <Outlet />
      </div>
    );
  }

  // Layout interno
  return (
    <div className="root-bg">
      {/* Barra superior fija, a todo el ancho */}
      <header className="app-header">
        <div className="app-header__inner">
          <div className="app-header__left">
            <div className="app-header__logo">IO</div>
            <span className="app-header__title">Inmovia Office</span>
          </div>

          <div className="app-header__search">
            <input
              type="text"
              placeholder="Buscar propiedades, clientes, contactos…"
              className="app-header__search-input"
            />
          </div>

          <div className="app-header__right" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Campanita de notificaciones integrada */}
            <div style={{ position: "relative", display: "inline-flex", marginRight: "0.25rem" }}>
              <button
                type="button"
                onClick={() => {
                  const newOpen = !isNotifOpen;
                  console.log("🔔 toggle panel:", newOpen);
                  setIsNotifOpen(newOpen);
                }}
                aria-label="Notificaciones"
                style={{
                  position: "relative",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      transform: "translate(40%, -30%)",
                      minWidth: "16px",
                      height: "16px",
                      padding: "0 3px",
                      borderRadius: "999px",
                      background: "#ef4444",
                      color: "#f9fafb",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 0 0 2px #e5e7eb",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Panel flotante de notificaciones */}
            {isNotifOpen && (
              <div
                style={{
                  position: "fixed",
                  top: "70px",
                  right: "16px",
                  width: "320px",
                  maxHeight: "420px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.28)",
                  border: "1px solid rgba(148, 163, 184, 0.35)",
                  zIndex: 9999,
                  padding: "12px 10px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "6px",
                    borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#0f172a",
                      }}
                    >
                      Notificaciones
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "#6b7280",
                      }}
                    >
                      {unreadCount} notificaciones sin leer
                    </div>
                  </div>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "0.75rem",
                      color: "#2563eb",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      console.log("➡️ marcar todas como leídas (mock)");
                      // Más adelante acá llamaremos a la API para marcar como leídas
                    }}
                  >
                    Marcar todas
                  </button>
                </div>

                <ul
                  style={{
                    margin: 0,
                    padding: "4px 0 0",
                    listStyle: "none",
                    overflowY: "auto",
                  }}
                >
                  <li
                    style={{
                      padding: "6px 8px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginTop: "4px",
                      background: "rgba(191, 219, 254, 0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Visita con comprador 17:00 hs</strong>
                    <br />
                    Propiedad en Banfield · Hoy 16:30 (en 30 min)
                  </li>
                  <li
                    style={{
                      padding: "6px 8px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginTop: "4px",
                      background: "rgba(191, 219, 254, 0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Aniversario de mudanza</strong>
                    <br />
                    Cliente: Familia González · Hoy 09:00
                  </li>
                  <li
                    style={{
                      padding: "6px 8px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginTop: "4px",
                      background: "rgba(191, 219, 254, 0.4)",
                      fontSize: "0.8rem",
                    }}
                  >
                    <strong>Recordatorio interno</strong>
                    <br />
                    Revisar documentos de reserva antes del viernes.
                  </li>
                </ul>
              </div>
            )}

            {/* Bloque usuario actual */}
            <div className="app-header__user">
              <div className="app-header__avatar">N</div>
              <div className="app-header__user-info">
                <span className="app-header__user-name">Nicolás</span>
                <span className="app-header__user-role">Owner</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Cuerpo: sidebar + contenido */}
      <div className="app-shell">
        <Sidebar />
        <main className={`app-content ${isChat ? "app-content--full" : ""}`}>
          <Outlet />
        </main>
      </div>

      {/* Chat flotante de Ivo-t */}
      <IvoTPanel isOpen={isIvoOpen} onClose={() => setIsIvoOpen(false)} />

      {/* Botón flotante de Ivo-t abajo a la derecha */}
      <button
        type="button"
        className="ivot-fab"
        onClick={() => setIsIvoOpen((open) => !open)}
        aria-label="Abrir Ivo-t"
      >
        Ivo
      </button>
    </div>
  );
};

export default App;
