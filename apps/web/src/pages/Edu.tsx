import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Edu.css";

// Mock de módulos
const MODULES = [
    { id: "captacion-01", title: "Captación de Propiedades I", level: "Básico", lessons: 8, est: "1h 20m", icon: "🏠" },
    { id: "ventas-01", title: "Cierre de Ventas Efectivo", level: "Intermedio", lessons: 6, est: "1h 05m", icon: "💼" },
    { id: "legales-01", title: "Reserva, Refuerzos y Documentación", level: "Avanzado", lessons: 10, est: "1h 45m", icon: "⚖️" },
    { id: "marketing-01", title: "Marketing Digital Inmobiliario", level: "Intermedio", lessons: 5, est: "0h 50m", icon: "📱" },
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
        <div className="page">
            <div className="edu-layout">

                {/* Header */}
                <div className="edu-header">
                    <div>
                        <h1 className="edu-title">Inmovia Edu</h1>
                        <p className="edu-subtitle">Capacitá a tus agentes con módulos creados por la oficina.</p>
                    </div>
                    {paid && (
                        <div className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                            Plan Activo
                        </div>
                    )}
                </div>

                {/* Banner Paywall */}
                {!paid && (
                    <div className="edu-banner">
                        <div className="banner-content">
                            <h3>Desbloqueá todo el potencial</h3>
                            <p>Accedé a todos los cursos, recursos descargables y certificaciones para tu equipo.</p>
                        </div>
                        <div className="banner-actions">
                            <button className="btn btn-ghost text-white" onClick={activateTrial}>
                                Activar Demo
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate("/ajustes")}>
                                Suscribirse
                            </button>
                        </div>
                    </div>
                )}

                {/* Grid de Cursos */}
                <div className="edu-grid">
                    {MODULES.map((m) => (
                        <div key={m.id} className="course-card">
                            <div className="course-level">{m.level}</div>
                            <div className="course-body">
                                <div className="course-icon">{m.icon}</div>
                                <h3 className="course-title">{m.title}</h3>
                                <div className="course-meta">
                                    <span>📚 {m.lessons} lecciones</span>
                                    <span>•</span>
                                    <span>⏱ {m.est}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: paid ? '0%' : '0%' }}></div>
                                </div>
                            </div>
                            <div className="course-footer">
                                <Link
                                    to={`/edu/${m.id}`}
                                    className="btn btn-primary btn-sm"
                                    onClick={(e) => {
                                        if (!paid) { e.preventDefault(); alert("Activa Inmovia Edu para acceder al contenido."); }
                                    }}
                                >
                                    {paid ? "Continuar" : "Ver Temario"}
                                </Link>
                                <button className="btn btn-ghost btn-sm">
                                    ♡
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-5 text-muted" style={{ fontSize: '0.9rem' }}>
                    Inmovia Edu · Contenido interno de la oficina · Próximamente: progreso por agente, quizzes y certificados.
                </div>

            </div>
        </div>
    );
}
