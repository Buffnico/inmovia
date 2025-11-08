import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Mock de módulos (por ahora local; luego vendrá desde la API)
const MODULES = [
  { id: "captacion-01", title: "Captación de Propiedades I", level: "Básico", lessons: 8, est: "1h 20m" },
  { id: "ventas-01", title: "Cierre de Ventas Efectivo", level: "Intermedio", lessons: 6, est: "1h 05m" },
  { id: "legales-01", title: "Reserva, Refuerzos y Documentación", level: "Avanzado", lessons: 10, est: "1h 45m" },
];

export default function Edu() {
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setPaid(localStorage.getItem("eduPaid") === "1");
  }, []);

  function activateTrial() {
    localStorage.setItem("eduPaid", "1");
    setPaid(true);
  }

  return (
    <div className="app-main">
      <div className="glass-panel">
        <div className="dash-header">
          <h1 className="brand-title">Inmovia Edu</h1>
          <p className="brand-sub">Capacitá a tus agentes con módulos creados por la oficina.</p>
        </div>

        {!paid && (
          <div
            className="panel"
            style={{
              marginBottom: 16,
              background: "linear-gradient(180deg, rgba(20,40,63,.55), rgba(10,20,32,.55))",
              border: "1px solid rgba(141,197,255,.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <strong>Plan Edu</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>
                Esta sección es paga. Activá el acceso para ver y estudiar los módulos.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={activateTrial}>Activar (demo)</button>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/ajustes")}
                title="Configuración de pagos (próximamente)"
              >
                Ir a pagos
              </button>
            </div>
          </div>
        )}

        <div className="cards-row">
          {MODULES.map((m) => (
            <div key={m.id} className="stat-card">
              <div className="stat-head">{m.level}</div>
              <div className="stat-value" style={{ fontSize: 24 }}>{m.title}</div>
              <div className="muted" style={{ marginTop: 4 }}>
                {m.lessons} lecciones • {m.est}
              </div>

              <div className="mini-bars">
                <span></span><span></span><span></span><span></span>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Link
                  className="btn btn-primary"
                  to={`/edu/${m.id}`}
                  onClick={(e) => {
                    if (!paid) { e.preventDefault(); alert("Activa Inmovia Edu para acceder al contenido."); }
                  }}
                >
                  Ver módulo
                </Link>
                <button
                  className="btn"
                  onClick={() => alert("Agregar a favoritos (próximo)")}
                >
                  ★
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="footer-muted" style={{ marginTop: 18 }}>
          Inmovia Edu · Contenido interno de la oficina · Próximamente: progreso por agente, quizzes y certificados.
        </div>
      </div>
    </div>
  );
}
