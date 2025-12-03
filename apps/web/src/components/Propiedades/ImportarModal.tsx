import React, { useState, useRef } from 'react';
import { apiFetch } from '../../services/apiClient';

interface ImportStats {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
}

interface ImportarModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ImportarModal: React.FC<ImportarModalProps> = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState<ImportStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setStats(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Por favor seleccioná un archivo.");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await apiFetch('/properties/importar/remax-excel', {
                method: 'POST',
                body: formData,
                // Do not set Content-Type header when sending FormData, 
                // fetch/browser sets it automatically with boundary.
                // apiFetch preserves this behavior as long as we don't override it in options.
            });

            const data = await res.json();

            if (data.ok) {
                setStats(data.stats);
                // Don't close immediately so user can see stats
            } else {
                setError(data.message || "Error al importar.");
            }
        } catch (err) {
            console.error(err);
            setError("Error de conexión al servidor.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-head">
                    <span>Importar desde CSV (RE/MAX)</span>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={uploading}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    {!stats ? (
                        <>
                            <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>
                                Subí el archivo CSV descargado del portal RE/MAX para actualizar o crear propiedades masivamente.
                            </p>

                            <div
                                className="upload-area"
                                style={{
                                    border: '2px dashed #cbd5e1',
                                    borderRadius: '12px',
                                    padding: '3rem 2rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: '#f8fafc',
                                    transition: 'all 0.2s'
                                }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                />
                                {file ? (
                                    <div>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>{file.name}</strong>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Clic para cambiar archivo</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📤</div>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a' }}>Hacé clic para elegir archivo</strong>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Soporta archivos .csv</span>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div style={{ marginTop: '1.5rem', color: '#b91c1c', backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                            <h3 style={{ marginBottom: '0.5rem', color: '#0f172a' }}>¡Importación finalizada!</h3>
                            <p className="text-muted">El proceso se completó correctamente.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', textAlign: 'left' }}>
                                <div className="stat-box" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Procesadas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>{stats.total}</div>
                                </div>
                                <div className="stat-box" style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.25rem' }}>Creadas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.created}</div>
                                </div>
                                <div className="stat-box" style={{ background: '#eff6ff', padding: '1rem', borderRadius: '10px', border: '1px solid #dbeafe' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#1e40af', marginBottom: '0.25rem' }}>Actualizadas</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.updated}</div>
                                </div>
                                <div className="stat-box" style={{ background: '#fef2f2', padding: '1rem', borderRadius: '10px', border: '1px solid #fee2e2' }}>
                                    <div style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '0.25rem' }}>Errores/Skipped</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>{stats.errors + stats.skipped}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-foot">
                    {!stats ? (
                        <>
                            <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!file || uploading}
                            >
                                {uploading ? 'Subiendo...' : 'Subir e Importar'}
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-primary w-100" onClick={onSuccess}>
                            Finalizar y Refrescar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportarModal;
