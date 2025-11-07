import { Link, useLocation } from "react-router-dom";

const Item = ({
  to,
  label,
  icon,
}: { to: string; label: string; icon: React.ReactNode }) => {
  const { pathname, hash } = useLocation();
  const active = (hash || pathname).includes(to);
  return (
    <Link
      to={`/${to}`}
      className={`side-item ${active ? "active" : ""}`}
      role="button"
      aria-current={active ? "page" : undefined}
    >
      <span className="side-ico">{icon}</span>
      <span className="side-txt">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-dot" />
        <div className="brand-name">Inmovia</div>
      </div>

      <nav className="side-nav">
        <Item
          to="propiedades"
          label="Propiedades"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3l9 7-1.5 2L12 6 4.5 12 3 10l9-7zM5 13h14v8H5z"
              />
            </svg>
          }
        />
        <Item
          to="documentos"
          label="Documentos"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6"
              />
            </svg>
          }
        />
        <Item
          to="chatbot"
          label="Brokersito"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M12 2a8 8 0 0 1 8 8v5a3 3 0 0 1-3 3h-2l-3 3-3-3H7a3 3 0 0 1-3-3v-5a8 8 0 0 1 8-8z"
              />
            </svg>
          }
        />
        <Item
          to="chat-grupal"
          label="Chat grupal"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M7 7h10v6H7zM3 17h18v2H3z"
              />
            </svg>
          }
        />
        <Item
          to="edu"
          label="Inmovia Edu"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor">
              {/* ícono birrete */}
              <path d="M12 3 2 8.5 12 14l10-5.5L12 3zM6 13.2V17c0 .4.2.8.6 1l5 3c.3.2.8.2 1.1 0l5-3c.4-.2.6-.6.6-1v-3.8l-6.1 3.3a1.5 1.5 0 0 1-1.4 0L6 13.2z" />
            </svg>
          }
        />

        <Item
          to="settings"
          label="Configuración"
          icon={
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8.94 4a7.94 7.94 0 0 0-.2-1.78l2.04-1.59-2-3.46-2.43 1a8.12 8.12 0 0 0-3.08-1.78l-.37-2.6H9.1l-.37 2.6A8.12 8.12 0 0 0 5.65 6.2l-2.43-1-2 3.46 2.04 1.59A7.94 7.94 0 0 0 3.06 12c0 .61.07 1.2.2 1.78L1.22 15.37l2 3.46 2.43-1c.92.75 1.96 1.33 3.08 1.78l.37 2.6h4.5l.37-2.6a8.12 8.12 0 0 0 3.08-1.78l2.43 1 2-3.46-2.04-1.59c.13-.58.2-1.17.2-1.78z"
              />
            </svg>
          }
        />
        <a href="#/login" className="side-item danger">
          <span className="side-ico">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="currentColor"
                d="M16 13v-2H7V8l-5 4 5 4v-3zM20 3h-8v2h8v14h-8v2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
              />
            </svg>
          </span>
          <span className="side-txt">Cerrar sesión</span>
        </a>
      </nav>
    </aside>
  );
}
