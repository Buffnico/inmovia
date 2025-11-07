import { useMemo, useState } from "react";

/**
 * Página de Configuración (segura para TS estricto).
 * No depende de ningún store externo. Lee/escribe en localStorage
 * y muestra un formulario minimal que respeta las clases del tema (index.css):
 * - .container-nice .section .card .h1 .lead .row .col .btn .btn-primary .input .select
 */
type OfficeType = "inmobiliaria" | "legal" | "marketing";
type ThemeName = "inmovia-dark" | "inmovia-blue" | "inmovia-emerald";

type SettingsModel = {
  displayName: string;
  officeType: OfficeType;
  theme: ThemeName;
  accentStrength: number; // 1-10
  autoSave: boolean;
};

const DEFAULTS: SettingsModel = {
  displayName: "Owner",
  officeType: "inmobiliaria",
  theme: "inmovia-dark",
  accentStrength: 7,
  autoSave: true,
};

const LS_KEY = "inmovia.settings.v1";

function loadSettings(): SettingsModel {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SettingsModel>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: SettingsModel) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export default function Settings() {
  const initial = useMemo(loadSettings, []);
  const [form, setForm] = useState<SettingsModel>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  function update<K extends keyof SettingsModel>(key: K, value: SettingsModel[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // acá en el futuro podríamos llamar a /api/settings
      saveSettings(form);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-nice section">
      <div className="h1">Configuración</div>
      <p className="lead">Preferencias de cuenta y apariencia para tu oficina.</p>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 16 }}>
          <div className="col" style={{ minWidth: 280, flex: "0 0 340px" }}>
            <div className="muted" style={{ marginBottom: 8 }}>Perfil</div>

            <label className="label">Nombre a mostrar</label>
            <input
              className="input"
              placeholder="Tu nombre"
              value={form.displayName}
              onChange={(e) => update("displayName", e.target.value)}
            />

            <label className="label" style={{ marginTop: 12 }}>Tipo de oficina</label>
            <select
              className="select"
              value={form.officeType}
              onChange={(e) => update("officeType", e.target.value as OfficeType)}
            >
              <option value="inmobiliaria">Inmobiliaria</option>
              <option value="legal">Estudio legal</option>
              <option value="marketing">Agencia de marketing</option>
            </select>

            <label className="label" style={{ marginTop: 12 }}>Auto-guardado</label>
            <div className="row" style={{ alignItems: "center", gap: 8 }}>
              <input
                id="autoSave"
                type="checkbox"
                checked={form.autoSave}
                onChange={(e) => update("autoSave", e.target.checked)}
              />
              <label htmlFor="autoSave">Guardar cambios automáticamente</label>
            </div>
          </div>

          <div className="col" style={{ minWidth: 280 }}>
            <div className="muted" style={{ marginBottom: 8 }}>Tema</div>

            <label className="label">Paleta</label>
            <select
              className="select"
              value={form.theme}
              onChange={(e) => update("theme", e.target.value as ThemeName)}
            >
              <option value="inmovia-dark">Inmovia Dark</option>
              <option value="inmovia-blue">Inmovia Blue</option>
              <option value="inmovia-emerald">Inmovia Emerald</option>
            </select>

            <label className="label" style={{ marginTop: 12 }}>
              Intensidad de acento: <b>{form.accentStrength}</b>
            </label>
            <input
              className="range"
              type="range"
              min={1}
              max={10}
              value={form.accentStrength}
              onChange={(e) => update("accentStrength", Number(e.target.value))}
            />

            <div className="muted" style={{ marginTop: 8 }}>
              Vista previa instantánea (no recarga la página).
            </div>
          </div>
        </div>

        <div className="row" style={{ marginTop: 16, justifyContent: "space-between" }}>
          <div className="muted">
            {savedAt ? `Guardado ${new Date(savedAt).toLocaleTimeString()}` : "Sin guardar"}
          </div>
          <div className="btn-group">
            <button
              className="btn"
              onClick={() => setForm(DEFAULTS)}
              disabled={saving}
              title="Restaurar valores por defecto"
            >
              Restablecer
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="h2">Temas y oficinas (placeholder)</div>
        <p className="muted">
          Dejamos el espacio listo para múltiples “ramas” de oficina. Por ahora se usa
          <b> inmobiliaria</b>. Más adelante, esta sección cargará módulos por tipo.
        </p>
      </div>
    </div>
  );
}
