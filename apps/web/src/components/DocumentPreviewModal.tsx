import React, { useEffect, useState } from "react";

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    modelId: string;
    title?: string;
    onUseModel: () => void;
}

const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:3001/api";

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, modelId, title, onUseModel }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && modelId) {
            const token = localStorage.getItem('token');
            // Fetch preview (blob)
            fetch(`${API_BASE_URL}/documents/office-models/${modelId}/preview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                })
                .catch(err => console.error("Error loading preview", err));
        }
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [isOpen, modelId]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content preview-modal">
                <div className="modal-header">
                    <h3>Vista Previa: {title}</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>
                <div className="preview-body">
                    {previewUrl ? (
                        <iframe src={previewUrl} className="preview-frame" title="Preview" />
                    ) : (
                        <p>Cargando vista previa...</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                    <button className="btn btn-primary" onClick={() => { onClose(); onUseModel(); }}>Usar este modelo</button>
                </div>
            </div>
            <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1100;
        }
        .preview-modal {
          width: 80%; height: 85vh; display: flex; flex-direction: column;
        }
        .preview-body { flex: 1; background: #f1f5f9; padding: 1rem; overflow: hidden; }
        .preview-frame { width: 100%; height: 100%; border: none; background: white; }
      `}</style>
        </div>
    );
};

export default DocumentPreviewModal;
