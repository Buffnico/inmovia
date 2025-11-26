import React, { useEffect, useState } from 'react';
import ProfileService from '../services/profileService';
import { ROLES } from "../config/roles";

export default function Perfil() {
    const [user, setUser] = useState<any>(null);
    const [office, setOffice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form States
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        secondaryPhone: '',
        timezone: '',
        locale: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [officeForm, setOfficeForm] = useState({
        officeName: '',
        brandName: '',
        officeAddress: '',
        officeCity: '',
        marketArea: '',
        defaultCurrency: 'USD',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        timezone: '',
        modules: {} as Record<string, boolean>
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userData = await ProfileService.getMyProfile();
            setUser(userData);
            setProfileForm({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                secondaryPhone: userData.secondaryPhone || '',
                timezone: userData.timezone || 'America/Argentina/Buenos_Aires',
                locale: userData.locale || 'es-AR'
            });

            if (userData.role === ROLES.OWNER) {
                const officeData = await ProfileService.getOfficeConfig();
                setOffice(officeData);
                setOfficeForm(officeData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        try {
            await ProfileService.updateMyProfile(profileForm);
            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al actualizar perfil' });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden' });
            return;
        }
        try {
            await ProfileService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error al cambiar contraseña' });
        }
    };

    const handleOfficeUpdate = async (e: React.FormEvent) => {
        if (e) e.preventDefault();
        setMessage(null);
        try {
            await ProfileService.updateOfficeConfig(officeForm);
            setMessage({ type: 'success', text: 'Configuración de oficina actualizada' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al actualizar oficina' });
        }
    };

    if (loading) return <div className="p-4">Cargando perfil...</div>;

    return (
        <div className="page-content">
            <div className="page-header">
                <h1 className="page-title">Mi Perfil</h1>
            </div>

            {message && (
                <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`} style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#b91c1c'
                }}>
                    {message.text}
                </div>
            )}

            <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Left Column: Personal Info */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Datos Personales</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleProfileUpdate}>
                            <div className="form-group mb-3">
                                <label className="form-label">Email (Solo lectura)</label>
                                <input type="text" className="form-control" value={user?.email} disabled style={{ background: '#f1f5f9' }} />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Rol</label>
                                <input type="text" className="form-control" value={user?.role} disabled style={{ background: '#f1f5f9' }} />
                            </div>
                            <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profileForm.firstName}
                                        onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label className="form-label">Apellido</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={profileForm.lastName}
                                        onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={profileForm.phone}
                                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Zona Horaria</label>
                                <select
                                    className="form-control"
                                    value={profileForm.timezone}
                                    onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}
                                >
                                    <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                                    <option value="UTC">UTC</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Guardar Cambios</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Security & Office */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Security Section */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Seguridad</h3>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handlePasswordChange}>
                                <div className="form-group mb-3">
                                    <label className="form-label">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-3">
                                    <label className="form-label">Confirmar Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-outline-primary w-100">Cambiar Contraseña</button>
                            </form>
                        </div>
                    </div>

                    {/* Office Config Section (Owner Only) */}
                    {user?.role === ROLES.OWNER && (
                        <div className="card" style={{ border: '1px solid #3b82f6' }}>
                            <div className="card-header" style={{ background: '#eff6ff' }}>
                                <h3 className="card-title" style={{ color: '#1e40af' }}>🏢 Configuración de Oficina</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={(e) => { e.preventDefault(); handleOfficeUpdate(e); }}>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Nombre de la Oficina</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={officeForm.officeName}
                                            onChange={e => setOfficeForm({ ...officeForm, officeName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label className="form-label">Dirección</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={officeForm.officeAddress}
                                            onChange={e => setOfficeForm({ ...officeForm, officeAddress: e.target.value })}
                                        />
                                    </div>
                                    <div className="row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Moneda</label>
                                            <select
                                                className="form-control"
                                                value={officeForm.defaultCurrency}
                                                onChange={e => setOfficeForm({ ...officeForm, defaultCurrency: e.target.value })}
                                            >
                                                <option value="USD">USD (Dólar)</option>
                                                <option value="ARS">ARS (Peso Arg)</option>
                                                <option value="EUR">EUR (Euro)</option>
                                            </select>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label className="form-label">Formato Fecha</label>
                                            <select
                                                className="form-control"
                                                value={officeForm.dateFormat}
                                                onChange={e => setOfficeForm({ ...officeForm, dateFormat: e.target.value })}
                                            >
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Guardar Configuración</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Modules Config Section (Owner Only) */}
                    {user?.role === ROLES.OWNER && officeForm.modules && (
                        <div className="card" style={{ border: '1px solid #8b5cf6' }}>
                            <div className="card-header" style={{ background: '#f5f3ff' }}>
                                <h3 className="card-title" style={{ color: '#5b21b6' }}>🧩 Módulos Activos</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {Object.entries(officeForm.modules).map(([key, isActive]) => (
                                        <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                            <div>
                                                <strong style={{ textTransform: 'capitalize' }}>{key}</strong>
                                                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Habilitar módulo {key}</div>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={isActive as boolean}
                                                    onChange={(e) => {
                                                        setOfficeForm(prev => ({
                                                            ...prev,
                                                            modules: {
                                                                ...prev.modules,
                                                                [key]: e.target.checked
                                                            }
                                                        }));
                                                    }}
                                                    style={{ cursor: 'pointer', width: '40px', height: '20px' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    className="btn btn-primary w-100 mt-3"
                                    onClick={(e) => handleOfficeUpdate(e)}
                                >
                                    Guardar Módulos
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
