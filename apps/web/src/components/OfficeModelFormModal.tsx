import React, { useState, useEffect } from "react";

interface OfficeModelFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    modelToEdit?: any; // If present, edit mode
}

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

const OfficeModelFormModal: React.FC<OfficeModelFormModalProps> = ({ isOpen, onClose, onSuccess, modelToEdit }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (modelToEdit) {
                setName(modelToEdit.name);
                setDescription(modelToEdit.description || "");
                setFile(null);
            } else {
                setName("");
                setDescription("");
                setFile(null);
            }
        }
    }, [isOpen, modelToEdit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (file) {
                formData.append("file", file);
            }

            const token = localStorage.getItem('token');
            const url = modelToEdit
                ? `${API_BASE_URL}/documents/office-models/${modelToEdit.id}`
                : `${API_BASE_URL}/documents/office-models`;

            const method = modelToEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Error al guardar modelo");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{modelToEdit ? "Editar Modelo" : "Nuevo Modelo de Oficina"}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group mb-3">
                        <label className="form-label">Nombre del Modelo</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                            className="form-control"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label className="form-label">Archivo Base (.docx)</label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".docx"
                            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                            required={!modelToEdit} // Required only on create
                        />
                        {modelToEdit && <small className="text-muted">Dejar vacío para mantener el archivo actual.</small>}
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
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
        .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
      `}</style>
        </div>
    );
};

export default OfficeModelFormModal;
