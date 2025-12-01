import React, { useState } from "react";

interface OfficeModel {
    id: string;
    name: string;
    description?: string;
    // other fields if needed
}

interface SelectOfficeModelModalProps {
    isOpen: boolean;
    officeModels: OfficeModel[];
    onClose: () => void;
    onSelect: (model: OfficeModel) => void;
}

const SelectOfficeModelModal: React.FC<SelectOfficeModelModalProps> = ({
    isOpen,
    officeModels,
    onClose,
    onSelect,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    if (!isOpen) return null;

    const filteredModels = officeModels.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content select-model-modal">
                <div className="modal-header">
                    <h2 className="modal-title">Elegir modelo de documento</h2>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Buscar modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div className="model-list">
                        {filteredModels.map((model) => (
                            <div key={model.id} className="select-model-item" onClick={() => onSelect(model)}>
                                <div className="model-info">
                                    <div className="model-name">{model.name}</div>
                                    {model.description && (
                                        <div className="model-desc">{model.description}</div>
                                    )}
                                </div>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelect(model);
                                    }}
                                >
                                    Usar
                                </button>
                            </div>
                        ))}

                        {filteredModels.length === 0 && (
                            <div className="empty-state">
                                <p>No se encontraron modelos.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          max-height: 85vh;
          overflow: hidden;
          animation: modal-in 0.2s ease-out;
        }

        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
        }

        .modal-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          color: #64748b;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
        }
        .modal-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          background: #f8fafc;
          flex: 1;
        }

        .model-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .select-model-item {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }

        .select-model-item:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .model-info {
          flex: 1;
        }

        .model-name {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .model-desc {
          font-size: 0.85rem;
          color: #64748b;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        
        /* Utility overrides if needed */
        .mb-3 { margin-bottom: 1rem; }
      `}</style>
        </div>
    );
};

export default SelectOfficeModelModal;
