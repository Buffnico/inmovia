import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Propiedad } from "./Propiedades";
import "./Propiedades.css";

const PropiedadesNueva: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado del formulario
    const [formData, setFormData] = useState<Partial<Propiedad> & { imagenes?: string[] }>({
        titulo: "",
        direccion: "",
        localidad: "",
        barrio: "",
        tipoOperacion: "Venta",
        tipoPropiedad: "Departamento",
        precio: 0,
        monedaPrecio: "USD",
        ambientes: 0,
        dormitorios: 0,
        supCubierta: 0,
        supDescubierta: 0,
        estado: "Activa",
        agente: "Agente Actual",
        cocheras: 0,
        antiguedad: 0,
        descripcion: "",
        cartel: false,
        imagenes: [],
        propietario: {
            nombre: "",
            email: "",
            celular: ""
        }
    });

    // Cargar datos si es edición
    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            fetch(`${API_BASE_URL}/properties/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.ok) {
                        setFormData(data.data);
                    } else {
                        setError("No se pudo cargar la propiedad.");
                    }
                })
                .catch(err => setError("Error de conexión."))
                .finally(() => setLoading(false));
        }
    }, [id, isEditing, API_BASE_URL]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (name.startsWith("propietario.")) {
            const field = name.split(".")[1];
            setFormData(prev => ({
                ...prev,
                propietario: {
                    ...prev.propietario!,
                    [field]: value
                }
            }));
            return;
        }

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
            return;
        }

        if (type === "number") {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Manejo de Fotos (Simulado)
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setFormData(prev => ({
                ...prev,
                imagenes: [...(prev.imagenes || []), ...newPhotos]
            }));
        }
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            imagenes: prev.imagenes?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const url = isEditing
                ? `${API_BASE_URL}/properties/${id}`
                : `${API_BASE_URL}/properties`;

            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (data.ok) {
                navigate(isEditing ? `/propiedades/${id}` : "/propiedades");
            } else {
                setError(data.message || "Error al guardar.");
            }
        } catch (err) {
            setError("Error de conexión al guardar.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="page"><p>Cargando...</p></div>;

    return (
        <div className="page">
            <div className="propiedades-layout">
                <div className="page-header">
                    <div>
                        <Link to={isEditing ? `/propiedades/${id}` : "/propiedades"} className="btn btn-ghost btn-sm mb-3 pl-0">
                            ← Cancelar
                        </Link>
                        <h1 className="page-title">{isEditing ? "Editar Propiedad" : "Nueva Propiedad"}</h1>
                    </div>
                    <div className="actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid-layout">

                    {/* 1. Multimedia (Hero) */}
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h3 className="card-title">Multimedia</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Cargá las mejores fotos para destacar tu propiedad.</p>
                        </div>
                        <div className="card-body">
                            <div
                                className="photo-upload-zone"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
                                <p style={{ margin: 0, fontWeight: 500 }}>Hacé clic para subir fotos</p>
                                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>Podés seleccionar varias a la vez</span>
                            </div>

                            {formData.imagenes && formData.imagenes.length > 0 && (
                                <div className="photo-grid">
                                    {formData.imagenes.map((src, index) => (
                                        <div key={index} className="photo-preview">
                                            <img src={src} alt={`Foto ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="photo-remove"
                                                onClick={() => removePhoto(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 2. Descripción (Full Width) */}
                    <div className="card" style={{ gridColumn: '1 / -1' }}>
                        <div className="card-header">
                            <h3 className="card-title">Descripción</h3>
                            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Contanos qué hace única a esta propiedad.</p>
                        </div>
                        <div className="card-body">
                            <textarea
                                className="form-control form-control-rounded"
                                name="descripcion"
                                value={formData.descripcion || ""}
                                onChange={handleChange}
                                rows={8}
                                placeholder="Describí los detalles, la zona, la luminosidad..."
                                style={{ borderRadius: '16px', resize: 'vertical', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* 3. Características y Detalles (Grid) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Características</h3>
                            </div>
                            <div className="card-body">
                                <div className="grid-3 mb-3">
                                    <div className="form-group">
                                        <label className="form-label">Ambientes</label>
                                        <input type="number" className="form-control form-control-rounded" name="ambientes" value={formData.ambientes} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Dormitorios</label>
                                        <input type="number" className="form-control form-control-rounded" name="dormitorios" value={formData.dormitorios} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cocheras</label>
                                        <input type="number" className="form-control form-control-rounded" name="cocheras" value={formData.cocheras} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid-3">
                                    <div className="form-group">
                                        <label className="form-label">Sup. Cubierta (m²)</label>
                                        <input type="number" className="form-control form-control-rounded" name="supCubierta" value={formData.supCubierta} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Sup. Descubierta (m²)</label>
                                        <input type="number" className="form-control form-control-rounded" name="supDescubierta" value={formData.supDescubierta} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Antigüedad (años)</label>
                                        <input type="number" className="form-control form-control-rounded" name="antiguedad" value={formData.antiguedad} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Datos Principales (Bottom) */}
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Datos Principales</h3>
                            </div>
                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label className="form-label">Título de la publicación</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-rounded"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Hermoso depto en Palermo"
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-rounded"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Barrio / Localidad</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-rounded"
                                            name="barrio"
                                            value={formData.barrio}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Estado, Precio y Cartel */}
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group mb-3">
                                    <label className="form-label">Estado</label>
                                    <select className="form-select form-select-rounded" name="estado" value={formData.estado} onChange={handleChange}>
                                        <option value="Activa">Activa</option>
                                        <option value="Reservada">Reservada</option>
                                        <option value="Vendida">Vendida</option>
                                        <option value="Alquilada">Alquilada</option>
                                        <option value="Suspendida">Suspendida</option>
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Operación</label>
                                    <select className="form-select form-select-rounded" name="tipoOperacion" value={formData.tipoOperacion} onChange={handleChange}>
                                        <option value="Venta">Venta</option>
                                        <option value="Alquiler">Alquiler</option>
                                        <option value="Alquiler Temporal">Temporal</option>
                                    </select>
                                </div>

                                <div className="form-group mb-3">
                                    <label className="form-label">Tipo Propiedad</label>
                                    <select className="form-select form-select-rounded" name="tipoPropiedad" value={formData.tipoPropiedad} onChange={handleChange}>
                                        <option value="Departamento">Departamento</option>
                                        <option value="Casa">Casa</option>
                                        <option value="PH">PH</option>
                                        <option value="Terreno">Terreno</option>
                                        <option value="Local">Local</option>
                                        <option value="Oficina">Oficina</option>
                                    </select>
                                </div>

                                <div className="grid-2 mb-3" style={{ gridTemplateColumns: '1fr 2fr' }}>
                                    <div className="form-group">
                                        <label className="form-label">Moneda</label>
                                        <select className="form-select form-select-rounded" name="monedaPrecio" value={formData.monedaPrecio} onChange={handleChange}>
                                            <option value="USD">USD</option>
                                            <option value="ARS">ARS</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Precio</label>
                                        <input type="number" className="form-control form-control-rounded" name="precio" value={formData.precio} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-check form-switch" style={{ padding: '1rem', background: 'var(--bg-root)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="cartel"
                                        id="cartelCheck"
                                        checked={!!formData.cartel}
                                        onChange={handleChange}
                                        style={{ width: '2.5rem', height: '1.5rem' }}
                                    />
                                    <label className="form-check-label" htmlFor="cartelCheck" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                        Tiene Cartel
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Propietario */}
                        <div className="card">
                            <div className="card-header">
                                <h4 className="card-title">Datos Propietario</h4>
                            </div>
                            <div className="card-body">
                                <div className="form-group mb-2">
                                    <label className="form-label">Nombre</label>
                                    <input type="text" className="form-control form-control-rounded" name="propietario.nombre" value={formData.propietario?.nombre || ""} onChange={handleChange} />
                                </div>
                                <div className="form-group mb-2">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-control form-control-rounded" name="propietario.email" value={formData.propietario?.email || ""} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Celular</label>
                                    <input type="text" className="form-control form-control-rounded" name="propietario.celular" value={formData.propietario?.celular || ""} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropiedadesNueva;
