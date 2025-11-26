import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Propiedad } from "./Propiedades";
import "./Propiedades.css";

import { useAuth } from "../store/auth";

const PropiedadesDetalle: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

    const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const token = localStorage.getItem('token');
            fetch(`${API_BASE_URL}/properties/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => {
                    if (data.ok) setPropiedad(data.data);
                    else navigate("/propiedades"); // Redirect if not found
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <div className="page"><p>Cargando...</p></div>;
    if (!propiedad) return <div className="page"><p>Propiedad no encontrada.</p></div>;

    const canEdit = user && (
        ['OWNER', 'ADMIN', 'MARTILLERO'].includes(user.role) ||
        (user.role === 'AGENTE' && propiedad.assignedAgentId === user.id)
    );

    return (
        <div className="page">
            <div className="propiedades-layout">
                <div className="page-header">
                    <div>
                        <Link to="/propiedades" className="btn btn-ghost btn-sm mb-3 pl-0">
                            ← Volver al listado
                        </Link>
                        <h1 className="page-title">{propiedad.titulo}</h1>
                        <p className="text-muted">{propiedad.direccion}, {propiedad.localidad}</p>
                    </div>
                    <div className="actions">
                        {canEdit && (
                            <Link to={`/propiedades/${propiedad.id}/editar`} className="btn btn-secondary">
                                Editar
                            </Link>
                        )}
                        <button className="btn btn-primary">
                            Compartir Ficha
                        </button>
                    </div>
                </div>

                <div className="grid-layout">

                    {/* Columna Principal */}
                    <div className="main-col" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Resumen */}
                        <div className="card">
                            <div className="card-body">
                                <div className="grid-4" style={{ textAlign: 'center' }}>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{propiedad.ambientes || '-'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Ambientes</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{propiedad.dormitorios || '-'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Dormitorios</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{propiedad.supCubierta || '-'} m²</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Cubierta</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{propiedad.cocheras || '-'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>Cocheras</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detalles */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Detalles de la Propiedad</h3>
                            </div>
                            <div className="card-body">
                                <div className="grid-2">
                                    <div className="kv"><span className="k">Tipo:</span> <span className="v">{propiedad.tipoPropiedad}</span></div>
                                    <div className="kv"><span className="k">Operación:</span> <span className="v">{propiedad.tipoOperacion}</span></div>
                                    <div className="kv"><span className="k">Precio:</span> <span className="v">{propiedad.monedaPrecio} {propiedad.precio?.toLocaleString()}</span></div>
                                    <div className="kv"><span className="k">Estado:</span> <span className="v">{propiedad.estado}</span></div>
                                    <div className="kv"><span className="k">Antigüedad:</span> <span className="v">{propiedad.antiguedad ? `${propiedad.antiguedad} años` : '-'}</span></div>
                                    <div className="kv"><span className="k">Sup. Total:</span> <span className="v">{propiedad.supDescubierta ? (propiedad.supCubierta || 0) + propiedad.supDescubierta : '-'} m²</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Descripción (Placeholder) */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Descripción</h3>
                            </div>
                            <div className="card-body">
                                <p className="text-muted">
                                    {/* Si tuviéramos descripción en el excel, iría acá. Por ahora un placeholder */}
                                    Excelente oportunidad en {propiedad.barrio}. Propiedad destacada por su ubicación y características.
                                    Consultar para más detalles.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar */}
                    <div className="side-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Info Interna */}
                        <div className="card glass-panel">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Info Interna</h4>
                                <div className="kv-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div className="kv"><span className="k">MLSID:</span> <span className="v">{propiedad.mlsid || '-'}</span></div>
                                    <div className="kv"><span className="k">Captación:</span> <span className="v">{propiedad.fechaCaptacion || '-'}</span></div>
                                    <div className="kv"><span className="k">Cartel:</span> <span className="v">{propiedad.cartel || 'No'}</span></div>
                                    <div className="kv"><span className="k">Días Mercado:</span> <span className="v">{propiedad.diasEnMercado || '-'}</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Propietario */}
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Propietario</h4>
                                {propiedad.propietario ? (
                                    <div className="owner-info">
                                        <div style={{ fontWeight: 'bold' }}>{propiedad.propietario.nombre || 'Sin nombre'}</div>
                                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>{propiedad.propietario.email}</div>
                                        <div className="text-muted" style={{ fontSize: '0.9rem' }}>{propiedad.propietario.celular}</div>
                                        <div className="mt-3">
                                            <button className="btn btn-sm btn-outline-primary w-100">Ver Contacto</button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted">No hay datos del propietario.</p>
                                )}
                            </div>
                        </div>

                        {/* Agente */}
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title mb-3">Agente a Cargo</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)' }}></div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{propiedad.agente}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{propiedad.oficina}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropiedadesDetalle;
