import React, { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { ROLES } from "../config/roles";

const Settings: React.FC = () => {
  const { user } = useAuth();

  // Local state for settings (mocking persistence for now)
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    language: "es",
    theme: "light"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setSettings(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setMessage(null);

    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setMessage("Configuración guardada correctamente.");
      // TODO: Call API to save settings
    }, 800);
  };

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="page-content" style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>Configuración</h1>
      <p className="text-muted" style={{ marginBottom: "2rem" }}>Gestiona tu cuenta y preferencias.</p>

      {message && (
        <div className="alert alert-success" style={{
          backgroundColor: "#d1e7dd",
          color: "#0f5132",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

      {/* Section 1: Account Info (Read Only for now) */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">Cuenta</h3>
        </div>
        <div className="card-body">
          <div className="row" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                value={user.name}
                disabled
                style={{ backgroundColor: "#f8fafc" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Rol</label>
              <input
                type="text"
                className="form-control"
                value={user.role}
                disabled
                style={{ backgroundColor: "#f8fafc" }}
              />
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={user.email || "usuario@inmovia.com"} // Fallback if email not in user object
              disabled
              style={{ backgroundColor: "#f8fafc" }}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Preferences */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">Preferencias</h3>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#475569" }}>Notificaciones</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                />
                <span>Recibir notificaciones por correo electrónico</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="pushNotifications"
                  checked={settings.pushNotifications}
                  onChange={handleChange}
                />
                <span>Recibir notificaciones push en el navegador</span>
              </label>
            </div>
            {/* TODO: Add granular notification settings (Agenda, Alquileres, etc.) */}
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "1rem", marginBottom: "1rem", color: "#475569" }}>Apariencia</h4>
            <div className="row" style={{ display: "flex", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Idioma</label>
                <select
                  className="form-select"
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Tema</label>
                <select
                  className="form-select"
                  name="theme"
                  value={settings.theme}
                  onChange={handleChange}
                >
                  <option value="light">Claro (Inmovia Light)</option>
                  <option value="dark">Oscuro (Beta)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Office Configuration (Owner Only) */}
      {user.role === ROLES.OWNER && (
        <div className="card" style={{ marginBottom: "2rem", border: "1px solid #bfdbfe", backgroundColor: "#eff6ff" }}>
          <div className="card-header" style={{ borderBottom: "1px solid #bfdbfe" }}>
            <h3 className="card-title" style={{ color: "#1e40af" }}>Configuración de Oficina</h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: "0.9rem", color: "#1e3a8a", marginBottom: "1rem" }}>
              Gestiona los módulos activos y la información de tu inmobiliaria.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-primary" onClick={() => alert("Próximamente: Panel de Módulos")}>
                Gestionar Módulos
              </button>
              <button className="btn btn-secondary" onClick={() => alert("Próximamente: Datos de Facturación")}>
                Datos de Facturación
              </button>
            </div>
            {/* TODO: Integrate with OfficeConfig module */}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
        <button className="btn btn-secondary" onClick={() => window.history.back()}>Cancelar</button>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* Hooks for future features */}
      {/* TODO: Add 'Ivo-t Statistics' section for Admins */}
      {/* TODO: Add 'Shared Resources' settings */}
    </div>
  );
};

export default Settings;
