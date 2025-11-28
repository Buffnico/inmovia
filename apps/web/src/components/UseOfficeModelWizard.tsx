import React, { useState } from "react";

interface UseOfficeModelWizardProps {
    isOpen: boolean;
    onClose: () => void;
    model: any;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

const UseOfficeModelWizard: React.FC<UseOfficeModelWizardProps> = ({ isOpen, onClose, model }) => {
    const [step, setStep] = useState(1);
    const [format, setFormat] = useState<"docx" | "pdf">("docx");
    const [manualData, setManualData] = useState({
        nombreCliente: "",
        dni: "",
        direccion: "",
        monto: "",
        fecha: new Date().toISOString().split('T')[0]
    });
    const [generating, setGenerating] = useState(false);

    if (!isOpen || !model) return null;

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
                a.download = `Generado_${model.name}.${format}`; // Filename might be overridden by backend header
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                onClose();
            } else {
                alert("Error al generar documento");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setGenerating(false);
        }
    };

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
                                <label>
                                    <input type="radio" checked={format === "docx"} onChange={() => setFormat("docx")} /> Word (.docx)
                                </label>
                                <label>
                                    <input type="radio" checked={format === "pdf"} onChange={() => setFormat("pdf")} /> PDF (.pdf)
                                </label>
                            </div>
                            <div className="mt-3 text-end">
                                <button className="btn btn-primary" onClick={() => setStep(2)}>Siguiente</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h4>Paso 2: Datos del Cliente</h4>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Nombre Cliente</label>
                                    <input className="form-control" value={manualData.nombreCliente} onChange={e => setManualData({ ...manualData, nombreCliente: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>DNI</label>
                                    <input className="form-control" value={manualData.dni} onChange={e => setManualData({ ...manualData, dni: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input className="form-control" value={manualData.direccion} onChange={e => setManualData({ ...manualData, direccion: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Monto</label>
                                    <input className="form-control" value={manualData.monto} onChange={e => setManualData({ ...manualData, monto: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Fecha</label>
                                    <input type="date" className="form-control" value={manualData.fecha} onChange={e => setManualData({ ...manualData, fecha: e.target.value })} />
                                </div>
                            </div>
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
                            <p>Cliente: {manualData.nombreCliente || "Sin nombre"}</p>

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
        }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .format-options { display: flex; gap: 2rem; margin: 1rem 0; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .mt-3 { margin-top: 1rem; }
        .text-end { text-align: right; }
        .me-2 { margin-right: 0.5rem; }
      `}</style>
        </div>
    );
};

export default UseOfficeModelWizard;
