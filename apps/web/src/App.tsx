// apps/web/src/App.tsx
import React from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import IvoTFab from "./components/IvoTFab";

import { useAuth } from "./store/auth";

const App: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === "/" || location.pathname === "" || location.pathname === "/login";

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
      <HeaderBar />

      {/* Cuerpo: sidebar + contenido */}
      <div className="app-shell">
        {/* Overlay para cerrar sidebar en mobile */}
        {isSidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`app-content ${isChat ? "app-content--full" : ""}`}>
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="bottom-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">🏠</span>
          <span className="bottom-nav__label">Inicio</span>
        </NavLink>

        <NavLink
          to="/agenda"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">📅</span>
          <span className="bottom-nav__label">Agenda</span>
        </NavLink>

        <NavLink
          to="/chat-interno"
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__icon">💬</span>
          <span className="bottom-nav__label">Chat</span>
        </NavLink>

        <button
          className={`bottom-nav__item ${isSidebarOpen ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span className="bottom-nav__icon">☰</span>
          <span className="bottom-nav__label">Menú</span>
        </button>
      </nav>

      {/* Chat flotante de Ivo-t (Solo si autenticado) */}
      {user && <IvoTFab />}
    </div>
  );
};

export default App;
