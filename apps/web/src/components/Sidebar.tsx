import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useOffice } from "../context/OfficeContext";
import { ROLES, Role } from "../config/roles";

type NavItem = {
  to: string;
  label: string;
  icon: string;
  iconClass?: string;
  allowedRoles?: Role[];
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
  { to: "/propiedades", label: "Propiedades", icon: "🏢" },
  { to: "/clientes", label: "Clientes", icon: "👥" },
  { to: "/documentos", label: "Documentos", icon: "📄" },
  { to: "/agenda", label: "Agenda & recordatorios", icon: "📅" },
  { to: "/chat-interno", label: "Chat interno", icon: "💬" },
  { to: "/redes", label: "Redes", icon: "📱" },
  {
    to: "/whatsapp",
    label: "WhatsApp",
    icon: "📞",
    iconClass: "sidebar__link-icon--whatsapp",
  },
  {
    to: "/ivot",
    label: "Ivo-t",
    icon: "🤖",
    iconClass: "sidebar__link-icon--ivot",
  },
  { to: "/edu", label: "Inmovia Edu", icon: "🎓" },
  { to: "/perfil", label: "Mi Perfil", icon: "👤" },
  {
    to: "/configuracion",
    label: "Configuración",
    icon: "⚙️",
    allowedRoles: [ROLES.OWNER]
  },
  {
    to: "/usuarios",
    label: "Usuarios",
    icon: "👥",
    allowedRoles: [ROLES.OWNER, ROLES.ADMIN]
  },
];

const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const { officeConfig } = useOffice();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter items based on active modules AND roles
  const filteredItems = navItems.filter(item => {
    // 1. Role Check
    if (item.allowedRoles && user) {
      if (!item.allowedRoles.includes(user.role as Role)) {
        return false;
      }
    }

    // 2. Module Check
    if (!officeConfig || !officeConfig.modules) return true; // Show all if loading or no config

    // Map routes to module keys
    const moduleMap: Record<string, string> = {
      '/propiedades': 'properties',
      '/agenda': 'agenda',
      '/clientes': 'contacts',
      '/whatsapp': 'whatsapp',
      '/edu': 'edu',
      '/documentos': 'scanner',
      '/redes': 'social',
      '/ivot': 'ivot'
    };

    const moduleKey = moduleMap[item.to];
    if (moduleKey) {
      return officeConfig.modules[moduleKey];
    }

    return true; // Always show non-module items (Dashboard, Config, etc.)
  });

  return (
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <nav className="sidebar__nav">
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              "sidebar__link" + (isActive ? " sidebar__link--active" : "")
            }
            onClick={() => {
              if (onClose) onClose();
            }}
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
        <button
          type="button"
          className="sidebar__logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
