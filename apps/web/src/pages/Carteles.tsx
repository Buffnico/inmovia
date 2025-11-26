import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Propiedad } from "./Propiedades";
import "./Propiedades.css";

const Carteles: React.FC = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
    const [items, setItems] = useState<Propiedad[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/properties`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    // Filtrar solo los que tienen cartel
                    const conCartel = data.data.filter((p: Propiedad) => p.cartel === true || p.cartel === "true");
                    setItems(conCartel);
                }
            })
            .finally(() => setLoading(false));
    }, [API_BASE_URL]);

    return (
        <div className="page">
            <div className="propiedades-layout">
                <div className="page-header">
                    <div>
                        <Link to="/propiedades" className="btn btn-ghost btn-sm" style={{ marginBottom: '0.5rem', paddingLeft: 0 }}>
                            ← Volver a Propiedades
                        </Link>
                        <h1 className="page-title">Gestión de Carteles</h1>
                        <p className="text-muted">Listado de propiedades con cartel activo para recepción.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando...</div>
                ) : items.length === 0 ? (
                    <div className="card">
                        <div className="card-body text-center" style={{ padding: '3rem' }}>
                            <h3>No hay carteles activos</h3>
                            <p className="text-muted">Ninguna propiedad tiene marcado el estado "Con Cartel".</p>
                        </div>
                    </div>
                ) : (
                    <div className="card">
                        <div className="card-body p-0">
                            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                        <th style={{ padding: '1rem' }}>Propiedad</th>
                                        <th style={{ padding: '1rem' }}>Dirección</th>
                                        <th style={{ padding: '1rem' }}>Agente</th>
                                        <th style={{ padding: '1rem' }}>Estado</th>
                                        <th style={{ padding: '1rem' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <strong>{p.titulo}</strong>
                                                <div className="text-muted" style={{ fontSize: '0.85rem' }}>{p.tipoOperacion}</div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{p.direccion}</td>
                                            <td style={{ padding: '1rem' }}>{p.agente}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className="badge badge-info">Con Cartel</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <Link to={`/propiedades/${p.id}`} className="btn btn-sm btn-ghost">
                                                    Ver Ficha
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Carteles;
