import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Edu.css";

type Section = {
    t: string;
    d: string;
};

type Resource = {
    name: string;
    type: string;
};

type ModuleData = {
    title: string;
    sections: Section[];
    resources: Resource[];
};

// Mock de módulos completos
const MODULES: Record<string, ModuleData> = {
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
    "marketing-01": {
        title: "Marketing Digital Inmobiliario",
        sections: [
            { t: "Redes Sociales", d: "Estrategia en Instagram y Facebook." },
            { t: "Portales", d: "Optimización de fichas en ZonaProp y Argenprop." },
        ],
        resources: [
            { name: "Calendario de contenidos", type: "XLSX" },
        ]
    }
};

export default function EduModule() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [paid, setPaid] = useState(false);

    useEffect(() => {
        setPaid(localStorage.getItem("eduPaid") === "1");
    }, []);

    const mod = useMemo(() => (id ? MODULES[id] : null), [id]);

    if (!mod) {
        return (
            <div className="page">
                <div className="edu-layout text-center" style={{ paddingTop: '4rem' }}>
                    <h2 className="edu-title">Módulo no encontrado</h2>
                    <button className="btn btn-primary mt-3" onClick={() => navigate("/edu")}>
                        Volver a Inmovia Edu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="edu-layout">

                {/* Header */}
                <div className="edu-header">
                    <div>
                        <button onClick={() => navigate("/edu")} className="btn btn-ghost btn-sm mb-2 pl-0">
                            ← Volver a Cursos
                        </button>
                        <h1 className="edu-title">{mod.title}</h1>
                        <p className="edu-subtitle">Contenido exclusivo para agentes Inmovia.</p>
                    </div>
                    <div>
                        {!paid ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => { localStorage.setItem("eduPaid", "1"); setPaid(true); }}
                            >
                                Activar Demo
                            </button>
                        ) : (
                            <div className="badge badge-success">En Progreso</div>
                        )}
                    </div>
                </div>

                <div className="module-layout">

                    {/* Sidebar (Info & Resources) */}
                    <aside className="module-sidebar">
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Recursos</h4>
                            <div className="resource-grid" style={{ gridTemplateColumns: '1fr' }}>
                                {mod.resources.map((r, i) => (
                                    <button
                                        key={i}
                                        className="resource-btn"
                                        disabled={!paid}
                                        onClick={() => alert(`Descargar ${r.name}`)}
                                    >
                                        <div className="resource-icon">{r.type}</div>
                                        <div className="resource-info">
                                            <div className="resource-name">{r.name}</div>
                                            <div className="resource-type">Descargar archivo</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Tu Progreso</h4>
                            <div className="progress-bar mb-2">
                                <div className="progress-fill" style={{ width: '0%' }}></div>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>0% Completado</div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="module-content">
                        {!paid && (
                            <div className="alert alert-warning" style={{ background: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
                                <strong>Modo Vista Previa:</strong> Activá Inmovia Edu para acceder al contenido completo y descargar los recursos.
                            </div>
                        )}

                        {mod.sections.map((s, i) => (
                            <div key={i} className="section-card">
                                <div className="section-number">Lección {i + 1}</div>
                                <h3 className="section-title">{s.t}</h3>
                                <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                    {paid ? s.d : "Contenido bloqueado. Suscribite para ver esta lección."}
                                </p>
                                {paid && (
                                    <button className="btn btn-outline-primary btn-sm mt-3">
                                        Comenzar Lección
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div>
    );
}
