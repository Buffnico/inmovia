// apps/web/src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

type NavItem = {
  to: string;
  label: string;
  icon: string;
  iconClass?: string;
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/propiedades", label: "Propiedades", icon: "🏢" },
  { to: "/clientes", label: "Clientes", icon: "👥" },
  { to: "/documentos", label: "Documentos", icon: "📄" },
  { to: "/agenda", label: "Agenda & recordatorios", icon: "📅" },
  { to: "/chat-interno", label: "Chat interno", icon: "💬" },
  { to: "/redes", label: "Redes", icon: "📱" },
  // WhatsApp → icono clásico verde con teléfono
  {
    to: "/whatsapp",
    label: "WhatsApp",
    icon: "📞",
    iconClass: "sidebar__link-icon--whatsapp",
  },
  // Ivo-t → robotito (usa el logo que guardaste)
  {
    to: "/ivot",
    label: "Ivo-t",
    icon: "",
    iconClass: "sidebar__link-icon--ivot",
  },
  { to: "/edu", label: "Inmovia Edu", icon: "🎓" },
  { to: "/configuracion", label: "Configuración", icon: "⚙️" },
];


const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
          >
            <span
              className={
                "sidebar__link-icon" +
                (item.iconClass ? " " + item.iconClass : "")
              }
              aria-hidden="true"
            >
              {item.icon}
            </span>
            <span className="sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__logout">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
