import React, { useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    role: string;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export const NewChatModal: React.FC<ModalProps> = ({ isOpen, onClose, users, onSubmit, isLoading }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Nuevo Chat</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        className="form-control mb-3"
                        placeholder="Buscar usuario..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="user-list-select" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className={`user-select-item ${selectedUserId === u.id ? 'selected' : ''}`}
                                onClick={() => setSelectedUserId(u.id)}
                            >
                                <div className="user-avatar-small">{u.name.charAt(0)}</div>
                                <div>
                                    <div className="fw-bold">{u.name}</div>
                                    <div className="text-muted small">{u.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        disabled={!selectedUserId || isLoading}
                        onClick={() => onSubmit({ type: 'direct', participantIds: [selectedUserId] })}
                    >
                        {isLoading ? 'Creando...' : 'Iniciar Chat'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const NewGroupModal: React.FC<ModalProps> = ({ isOpen, onClose, users, onSubmit, isLoading }) => {
    const [name, setName] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Nuevo Grupo</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group mb-3">
                        <label>Nombre del Grupo</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ej: Ventas Marzo"
                        />
                    </div>
                    <label>Participantes ({selectedIds.length})</label>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="user-list-select" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className={`user-select-item ${selectedIds.includes(u.id) ? 'selected' : ''}`}
                                onClick={() => toggleUser(u.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(u.id)}
                                    readOnly
                                    style={{ marginRight: '10px' }}
                                />
                                <div>
                                    <div className="fw-bold">{u.name}</div>
                                    <div className="text-muted small">{u.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        disabled={!name || selectedIds.length === 0 || isLoading}
                        onClick={() => onSubmit({ type: 'group', name, participantIds: selectedIds })}
                    >
                        {isLoading ? 'Creando...' : 'Crear Grupo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const BroadcastModal: React.FC<ModalProps> = ({ isOpen, onClose, users, onSubmit, isLoading }) => {
    const [text, setText] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    if (!isOpen) return null;

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleUser = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === users.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(users.map(u => u.id));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Mensaje Masivo (Broadcast)</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="form-group mb-3">
                        <label>Mensaje</label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label>Destinatarios ({selectedIds.length})</label>
                        <button className="btn btn-sm btn-outline-primary" onClick={toggleAll}>
                            {selectedIds.length === users.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                        </button>
                    </div>

                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <div className="user-list-select" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredUsers.map(u => (
                            <div
                                key={u.id}
                                className={`user-select-item ${selectedIds.includes(u.id) ? 'selected' : ''}`}
                                onClick={() => toggleUser(u.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(u.id)}
                                    readOnly
                                    style={{ marginRight: '10px' }}
                                />
                                <div>
                                    <div className="fw-bold">{u.name}</div>
                                    <div className="text-muted small">{u.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        disabled={!text || selectedIds.length === 0 || isLoading}
                        onClick={() => onSubmit({ recipientIds: selectedIds, text })}
                    >
                        {isLoading ? 'Enviando...' : 'Enviar Broadcast'}
                    </button>
                </div>
            </div>
            <style>{`
                .user-select-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    border-bottom: 1px solid #eee;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .user-select-item:hover {
                    background: #f8f9fa;
                }
                .user-select-item.selected {
                    background: #e3f2fd;
                }
                .user-avatar-small {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #ccc;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 10px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};
