import React, { useState, useEffect } from "react";

interface UseOfficeModelWizardProps {
    isOpen: boolean;
    onClose: () => void;
    model: any;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

const UseOfficeModelWizard: React.FC<UseOfficeModelWizardProps> = ({ isOpen, onClose, model }) => {
    const [step, setStep] = useState(1);
    const [format, setFormat] = useState<"docx" | "pdf">("docx");
    const [placeholders, setPlaceholders] = useState<string[]>([]);
    const [manualData, setManualData] = useState<Record<string, string>>({});
    const [loadingPlaceholders, setLoadingPlaceholders] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [templateError, setTemplateError] = useState<string | null>(null);

    // Reserved placeholders that we don't want to ask the user for
    const RESERVED_PLACEHOLDERS = ["fechaHoy", "clausulas_extra", "clausula_1", "clausula_2", "clausula_3", "clausula_4", "clausula_5"];

    useEffect(() => {
        if (isOpen && model) {
            setStep(1);
            setManualData({});
            setTemplateError(null);
            fetchPlaceholders();
        }
    }, [isOpen, model]);

    // ... (rest of the code)



    const fetchPlaceholders = async () => {
        setLoadingPlaceholders(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/documents/office-models/${model.id}/placeholders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Filter out reserved placeholders
                const filtered = (data.placeholders || []).filter((p: string) => !RESERVED_PLACEHOLDERS.includes(p) && !p.startsWith('clausula_'));
                setPlaceholders(filtered);

                // Initialize form data
                const initialData: Record<string, string> = {};
                filtered.forEach((p: string) => {
                    initialData[p] = "";
                });
                setManualData(initialData);
            } else {
                console.error("Failed to fetch placeholders");
                setPlaceholders([]);
            }
        } catch (e) {
            console.error(e);
            setPlaceholders([]);
        } finally {
            setLoadingPlaceholders(false);
        }
    };

    const handleInputChange = (key: string, value: string) => {
        setManualData(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/documents/office-models/${model.id}/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    formato: format,
                    datosManual: manualData,
                    clausulasPersonalizadas: [] // Empty for simple mode
                })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const ext = format === 'pdf' ? 'pdf' : 'docx';
                a.download = `Generado_${model.name}.${ext}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
                onClose();
            } else {
                const errData = await res.json().catch(() => ({}));
                if (res.status === 401 || res.status === 403) {
                    alert("Tu sesión ha expirado. Por favor, volvé a iniciar sesión.");
                } else if (res.status === 400 && errData.message && errData.message.includes("Error en la plantilla")) {
                    // Show friendly error in UI
                    setTemplateError("No se pudo generar el documento porque la plantilla tiene etiquetas mal configuradas. Revisá los {{placeholders}} en el archivo Word.");
                } else {
                    alert(errData.message || "Error al generar documento");
                }
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setGenerating(false);
        }
    };

    if (!isOpen || !model) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Usar Modelo: {model.name}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="modal-body">
                    {step === 1 && (
                        <div>
                            <h4>Paso 1: Formato</h4>
                            <div className="format-options">
                                <label className="radio-label">
                                    <input type="radio" checked={format === "docx"} onChange={() => setFormat("docx")} />
                                    <span>Word (.docx)</span>
                                </label>
                                <label className="radio-label">
                                    <input type="radio" checked={format === "pdf"} onChange={() => setFormat("pdf")} />
                                    <span>PDF (.pdf)</span>
                                </label>
                            </div>

                            {loadingPlaceholders ? (
                                <p>Cargando campos del documento...</p>
                            ) : (
                                <div className="mt-3 text-end">
                                    <button className="btn btn-primary" onClick={() => setStep(2)}>Siguiente</button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h4>Paso 2: Completar Datos</h4>
                            {placeholders.length === 0 ? (
                                <p className="text-muted">Este documento no tiene campos variables detectados (o son automáticos).</p>
                            ) : (
                                <div className="form-grid">
                                    {placeholders.map(p => (
                                        <div className="form-group" key={p}>
                                            <label style={{ textTransform: 'capitalize' }}>{p.replace(/_/g, ' ')}</label>
                                            <input
                                                className="form-control"
                                                value={manualData[p] || ''}
                                                onChange={e => handleInputChange(p, e.target.value)}
                                                placeholder={`Ingresar ${p}...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-3 text-end">
                                <button className="btn btn-secondary me-2" onClick={() => setStep(1)}>Atrás</button>
                                <button className="btn btn-primary" onClick={() => setStep(3)}>Siguiente</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h4>Paso 3: Confirmar</h4>
                            <p>Se generará el documento <strong>{model.name}</strong> en formato <strong>{format.toUpperCase()}</strong>.</p>

                            {Object.keys(manualData).length > 0 && (
                                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                                    <strong>Datos ingresados:</strong>
                                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                                        {Object.entries(manualData).map(([k, v]) => (
                                            <li key={k}>
                                                <span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>: {v || <em className="text-muted">(vacío)</em>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {templateError && (
                                <div className="alert alert-danger" style={{ color: '#721c24', backgroundColor: '#f8d7da', borderColor: '#f5c6cb', padding: '0.75rem 1.25rem', marginBottom: '1rem', borderRadius: '0.25rem' }}>
                                    {templateError}
                                </div>
                            )}

                            <div className="mt-3 text-end">
                                <button className="btn btn-secondary me-2" onClick={() => setStep(2)}>Atrás</button>
                                <button className="btn btn-success" onClick={handleGenerate} disabled={generating}>
                                    {generating ? "Generando..." : "Generar Documento"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white; padding: 1.5rem; border-radius: 8px; width: 100%;
          max-height: 90vh; overflow-y: auto;
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .format-options { display: flex; gap: 2rem; margin: 1rem 0; }
        .radio-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        .mt-3 { margin-top: 1rem; }
        .text-end { text-align: right; }
        .me-2 { margin-right: 0.5rem; }
        .text-muted { color: #64748b; }
      `}</style>
        </div>
    );
};

export default UseOfficeModelWizard;
