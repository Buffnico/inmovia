import React, { useState, useEffect } from 'react';

interface SignatureUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploaded: () => void;
    canSendToSignature: boolean;
}

interface Property {
    id: string;
    code: string;
    address: string;
    city: string;
}

interface Contact {
    id: string;
    name: string;
    lastName: string;
    type: string;
}

interface Agent {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function SignatureUploadModal({ isOpen, onClose, onUploaded, canSendToSignature }: SignatureUploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('contratos'); // Default to Contratos for signatures
    const [propertyId, setPropertyId] = useState('');
    const [contactId, setContactId] = useState('');
    const [agentUserId, setAgentUserId] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const [properties, setProperties] = useState<Property[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [propertySearch, setPropertySearch] = useState('');
    const [contactSearch, setContactSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setFile(null);
            setTitle('');
            setCategory('contratos');
            setPropertyId('');
            setContactId('');
            setAgentUserId('');
            setPropertySearch('');
            setContactSearch('');
            setIsUploading(false);

            // Fetch data
            fetchProperties();
            fetchContacts();
            if (canSendToSignature) {
                fetchAgents();
            }
        }
    }, [isOpen, canSendToSignature]);

    useEffect(() => {
        if (propertySearch.trim() === '') {
            setFilteredProperties(properties);
        } else {
            const lower = propertySearch.toLowerCase();
            setFilteredProperties(properties.filter(p =>
                (p.code && p.code.toLowerCase().includes(lower)) ||
                (p.address && p.address.toLowerCase().includes(lower))
            ));
        }
    }, [propertySearch, properties]);

    useEffect(() => {
        if (contactSearch.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const lower = contactSearch.toLowerCase();
            setFilteredContacts(contacts.filter(c =>
                (c.name && c.name.toLowerCase().includes(lower)) ||
                (c.lastName && c.lastName.toLowerCase().includes(lower))
            ));
        }
    }, [contactSearch, contacts]);

    const fetchProperties = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/properties', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                setProperties(data.data);
                setFilteredProperties(data.data);
            }
        } catch (error) {
            console.error("Error fetching properties:", error);
        }
    };

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/contacts', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                setContacts(data.data);
                setFilteredContacts(data.data);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    const fetchAgents = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                // Filter only agents if needed, or show all users
                setAgents(data.data);
            }
        } catch (error) {
            console.error("Error fetching agents:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            if (!title) {
                // Auto-fill title with filename without extension
                const name = e.target.files[0].name;
                const nameWithoutExt = name.substring(0, name.lastIndexOf('.')) || name;
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('category', category);
        if (propertyId) formData.append('propertyId', propertyId);
        if (contactId) formData.append('contactId', contactId);
        if (canSendToSignature && agentUserId) formData.append('agentUserId', agentUserId);

        // Enable signature
        formData.append('signatureEnabled', 'true');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3001/api/documents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.ok) {
                onUploaded();
                onClose();
            } else {
                const err = await res.json();
                alert(`Error al subir: ${err.message || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            alert("Error de conexión al subir el archivo.");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h3>{canSendToSignature ? 'Enviar documento a firma digital' : 'Solicitar firma digital'}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <p className="text-muted mb-3" style={{ fontSize: '0.9rem', color: '#666' }}>
                        {canSendToSignature
                            ? "Este documento se enviará a firma digital y quedará en estado Pendiente."
                            : "Se notificará a los responsables para aprobar y enviar este documento a firma."}
                    </p>

                    <div className="form-group mb-3">
                        <label className="form-label">Archivo (PDF) *</label>
                        <input
                            type="file"
                            className="form-control"
                            onChange={handleFileChange}
                            accept="application/pdf"
                            required
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Título</label>
                        <input
                            type="text"
                            className="form-control"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ej: Contrato de Alquiler 2024"
                        />
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Carpeta Destino</label>
                        <select
                            className="form-control"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="contratos">Contratos</option>
                            <option value="identidad">Identidad</option>
                            <option value="legal">Legal</option>
                            <option value="planos">Planos</option>
                            <option value="borradores">Borradores</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Propiedad (Opcional)</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Buscar propiedad..."
                            value={propertySearch}
                            onChange={e => setPropertySearch(e.target.value)}
                        />
                        <select
                            className="form-control"
                            value={propertyId}
                            onChange={e => {
                                setPropertyId(e.target.value);
                                const selected = properties.find(p => p.id === e.target.value);
                                if (selected) setPropertySearch(`${selected.code} - ${selected.address}`);
                            }}
                            size={3}
                            style={{ height: '80px' }}
                        >
                            <option value="">-- Ninguna --</option>
                            {filteredProperties.map(p => (
                                <option key={p.id} value={p.id}>
                                    [{p.code}] {p.address}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Cliente (Opcional)</label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Buscar cliente..."
                            value={contactSearch}
                            onChange={e => setContactSearch(e.target.value)}
                        />
                        <select
                            className="form-control"
                            value={contactId}
                            onChange={e => {
                                setContactId(e.target.value);
                                const selected = contacts.find(c => c.id === e.target.value);
                                if (selected) setContactSearch(`${selected.name} ${selected.lastName}`);
                            }}
                            size={3}
                            style={{ height: '80px' }}
                        >
                            <option value="">-- Ninguno --</option>
                        </select>
                    </div>

                    {canSendToSignature && (
                        <div className="form-group mb-3">
                            <label className="form-label">Agente Responsable (Opcional)</label>
                            <select
                                className="form-control"
                                value={agentUserId}
                                onChange={e => setAgentUserId(e.target.value)}
                            >
                                <option value="">-- Seleccionar Agente --</option>
                                {agents.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isUploading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={!file || isUploading}>
                            {isUploading ? 'Procesando...' : (canSendToSignature ? 'Enviar a firma' : 'Solicitar firma')}
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
                .form-group { margin-bottom: 1rem; }
                .form-label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-3 { margin-bottom: 1rem; }
            `}</style>
        </div>
    );
}
