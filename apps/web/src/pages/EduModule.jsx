import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Mock de módulos completos (por ahora local)
const MODULES = {
  "captacion-01": {
    title: "Captación de Propiedades I",
    sections: [
      { t: "Introducción", d: "Objetivos de captación y perfil del propietario." },
      { t: "Prospección", d: "Canales, guión base y seguimiento." },
      { t: "Reunión", d: "Estructura de la entrevista y objeciones comunes." },
      { t: "Cierre", d: "Compromisos, próximos pasos y documentación." },
    ],
    resources: [
      { name: "Guión de llamada", type: "DOCX" },
      { name: "Checklist de visita", type: "PDF" },
    ],
  },
  "ventas-01": {
    title: "Cierre de Ventas Efectivo",
    sections: [
      { t: "Psicología del comprador", d: "Disparadores y señales." },
      { t: "Técnicas de cierre", d: "Alternativa, resumen, por descarte." },
      { t: "Seguimiento", d: "Mensajería y timing ideal." },
    ],
    resources: [{ name: "Plantilla de seguimiento", type: "XLSX" }],
  },
  "legales-01": {
    title: "Reserva, Refuerzos y Documentación",
    sections: [
      { t: "Reserva", d: "Puntos críticos y validaciones." },
      { t: "Refuerzos", d: "Cláusulas y comunicación al cliente." },
      { t: "Documentación", d: "Checklist según tipo de operación." },
    ],
    resources: [
      { name: "Modelo de reserva", type: "DOCX" },
      { name: "Checklist documentación", type: "PDF" },
    ],
  },
};

export default function EduModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setPaid(localStorage.getItem("eduPaid") === "1");
  }, []);

  const mod = useMemo(() => MODULES[id] ?? null, [id]);

  if (!mod) {
    return (
      <div className="app-main">
        <div className="glass-panel">
          <h2 className="brand-title" style={{ fontSize: 28 }}>Módulo no encontrado</h2>
          <button className="btn" onClick={() => navigate("/edu")} style={{ marginTop: 12 }}>
            Volver a Inmovia Edu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-main">
      <div className="glass-panel">
        <div className="dash-header" style={{ alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="brand-title">{mod.title}</h1>
            <p className="brand-sub">Contenido interno para agentes.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => navigate("/edu")}>Volver</button>
            {!paid ? (
              <button
                className="btn btn-primary"
                onClick={() => { localStorage.setItem("eduPaid", "1"); setPaid(true); }}
              >
                Activar (demo)
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => alert("Marcado como completado (próximo)")}>
                Marcar completado
              </button>
            )}
          </div>
        </div>

        {!paid && (
          <div className="panel" style={{ marginBottom: 16 }}>
            <strong>Acceso limitado</strong>
            <p className="muted">Activá Inmovia Edu para ver el contenido completo del módulo.</p>
          </div>
        )}

        <div className="cards-row">
          {mod.sections.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-head">Sección {i + 1}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{s.t}</div>
              <p className="muted" style={{ marginTop: 6 }}>
                {paid ? s.d : "Contenido oculto — activa Inmovia Edu para ver esta sección."}
              </p>
            </div>
          ))}
        </div>

        <div className="panel" style={{ marginTop: 16 }}>
          <strong>Recursos</strong>
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 10 }}>
            {mod.resources.map((r, i) => (
              <button
                key={i}
                className="btn"
                disabled={!paid}
                onClick={() => alert(`Descargar ${r.name} (${r.type}) — (próximo)`)}
                title={paid ? "Descargar" : "Activá Inmovia Edu para descargar"}
              >
                {r.type} · {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="footer-muted" style={{ marginTop: 12 }}>
          Próximamente: progreso por agente, IA tutor, evaluaciones y certificados.
        </div>
      </div>
    </div>
  );
}
