import React, { useState } from 'react';
import { InstagramAccount, createInstagramAccount, updateIvoSettings } from '../services/instagramService';
import { useAuth } from '../store/auth';

interface Props {
    accounts: InstagramAccount[];
    onUpdate: () => void;
}

export default function RedesInstagramConfig({ accounts, onUpdate }: Props) {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ type: 'PERSONAL', igUsername: '', displayName: '' });
    const [loading, setLoading] = useState(false);

    const personalAccount = accounts.find(a => a.type === 'PERSONAL');
    const officeAccount = accounts.find(a => a.type === 'OFICINA');
    const isEncargado = user && ['OWNER', 'ADMIN', 'MARTILLERO', 'RECEPCIONISTA'].includes(user.role?.toUpperCase());

    const handleEdit = (type: 'PERSONAL' | 'OFICINA', account?: InstagramAccount) => {
        setFormData({
            type,
            igUsername: account ? account.igUsername : '',
            displayName: account ? account.displayName : ''
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await createInstagramAccount(formData as any);
            if (res.ok) {
                setIsEditing(false);
                onUpdate();
            } else {
                alert(res.message);
            }
        } catch (error) {
            console.error(error);
            alert("Error al guardar configuración");
        } finally {
            setLoading(false);
        }
    };

    const handleIvoToggle = async (account: InstagramAccount, setting: 'suggestMode' | 'autoReplyMode') => {
        const newVal = !account.ivoSettings?.[setting];
        try {
            await updateIvoSettings(account.id, { [setting]: newVal });
            onUpdate();
        } catch (error) {
            console.error(error);
            alert("Error al actualizar configuración de Ivo-t");
        }
    };

    return (
        <div className="config-container">
            <div className="status-badge">
                <span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: '50%' }}></span>
                Estado de integración: Modo Demo
            </div>

            <h3 className="mb-2 fw-bold text-dark">Configuración de Cuentas</h3>
            <p className="text-muted mb-4">
                En la versión productiva, esta sección se conectará a la API oficial de Meta.
            </p>

            <div className="row g-4 text-start">
                {/* Personal Account */}
                <div className="col-12">
                    <div className="config-card">
                        <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                            👤 Mi Cuenta Personal
                            {personalAccount && <span className="badge bg-success rounded-pill" style={{ fontSize: '0.7rem' }}>Conectada</span>}
                        </h5>
                        <p className="text-muted small mb-4">Gestiona tus publicaciones y mensajes personales.</p>

                        {personalAccount ? (
                            <div className="account-details">
                                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                                    <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 50, height: 50, fontSize: '1.5rem' }}>
                                        📸
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{personalAccount.displayName}</h6>
                                        <div className="text-muted small">@{personalAccount.igUsername}</div>
                                    </div>
                                    <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => handleEdit('PERSONAL', personalAccount)}>
                                        Editar
                                    </button>
                                </div>

                                <h6 className="fw-bold mb-3">🤖 Ivo-t Asistente</h6>
                                <div className="d-flex flex-column gap-3">
                                    <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                        <input
                                            className="form-check-input ms-0"
                                            type="checkbox"
                                            checked={personalAccount.ivoSettings?.suggestMode || false}
                                            onChange={() => handleIvoToggle(personalAccount, 'suggestMode')}
                                            style={{ width: '2.5em', height: '1.25em' }}
                                        />
                                        <label className="form-check-label">Sugerir respuestas automáticas</label>
                                    </div>
                                    <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                        <input
                                            className="form-check-input ms-0"
                                            type="checkbox"
                                            checked={personalAccount.ivoSettings?.autoReplyMode || false}
                                            onChange={() => handleIvoToggle(personalAccount, 'autoReplyMode')}
                                            style={{ width: '2.5em', height: '1.25em' }}
                                        />
                                        <label className="form-check-label text-muted">Respuesta automática (Beta)</label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 bg-light rounded-3">
                                <p className="mb-3 text-muted">No has conectado tu cuenta aún.</p>
                                <button className="btn btn-primary" onClick={() => handleEdit('PERSONAL')}>
                                    Conectar Cuenta
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Office Account */}
                {isEncargado && (
                    <div className="col-12">
                        <div className="config-card">
                            <h5 className="card-title d-flex align-items-center gap-2 mb-3">
                                🏢 Cuenta de Oficina
                                {officeAccount && <span className="badge bg-info text-dark rounded-pill" style={{ fontSize: '0.7rem' }}>Oficial</span>}
                            </h5>
                            <p className="text-muted small mb-4">Cuenta compartida para la gestión de la inmobiliaria.</p>

                            {officeAccount ? (
                                <div className="account-details">
                                    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                                        <div className="rounded-circle bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 50, height: 50, fontSize: '1.5rem' }}>
                                            🏢
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{officeAccount.displayName}</h6>
                                            <div className="text-muted small">@{officeAccount.igUsername}</div>
                                        </div>
                                        <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={() => handleEdit('OFICINA', officeAccount)}>
                                            Editar
                                        </button>
                                    </div>

                                    <h6 className="fw-bold mb-3">🤖 Ivo-t Asistente</h6>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                            <input
                                                className="form-check-input ms-0"
                                                type="checkbox"
                                                checked={officeAccount.ivoSettings?.suggestMode || false}
                                                onChange={() => handleIvoToggle(officeAccount, 'suggestMode')}
                                                style={{ width: '2.5em', height: '1.25em' }}
                                            />
                                            <label className="form-check-label">Sugerir respuestas automáticas</label>
                                        </div>
                                        <div className="form-check form-switch d-flex align-items-center gap-2 ps-0">
                                            <input
                                                className="form-check-input ms-0"
                                                type="checkbox"
                                                checked={officeAccount.ivoSettings?.autoReplyMode || false}
                                                onChange={() => handleIvoToggle(officeAccount, 'autoReplyMode')}
                                                style={{ width: '2.5em', height: '1.25em' }}
                                            />
                                            <label className="form-check-label text-muted">Respuesta automática (Beta)</label>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-light rounded-3">
                                    <p className="mb-3 text-muted">No se ha configurado la cuenta oficial.</p>
                                    <button className="btn btn-primary" onClick={() => handleEdit('OFICINA')}>
                                        Configurar Cuenta
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal (Simple overlay) */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="m-0 fw-bold">{formData.type === 'PERSONAL' ? 'Conectar Cuenta Personal' : 'Configurar Cuenta Oficina'}</h5>
                            <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
                        </div>
                        <div className="p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3 text-start">
                                    <label className="form-label fw-bold small text-muted">USUARIO DE INSTAGRAM (SIN @)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.igUsername}
                                        onChange={e => setFormData({ ...formData, igUsername: e.target.value })}
                                        placeholder="ej. remaxinfinit"
                                    />
                                </div>
                                <div className="mb-4 text-start">
                                    <label className="form-label fw-bold small text-muted">NOMBRE PARA MOSTRAR</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.displayName}
                                        onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                                        placeholder="ej. Juan Perez - Remax"
                                    />
                                </div>
                                <div className="d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
