import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { User, UserRole } from '../services/authService';

const ROLES: UserRole[] = ['ADMIN', 'MARTILLERO', 'AGENTE', 'RECEPCIONISTA', 'OTRO'];

export default function Usuarios() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newRole, setNewRole] = useState<UserRole>('AGENTE');
    const [creating, setCreating] = useState(false);

    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        if (!token || currentUser.role !== 'OWNER') {
            navigate('/login');
            return;
        }
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await AuthService.getUsers(token!);
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await AuthService.createUser(token!, {
                name: newName,
                email: newEmail,
                password: newPass,
                role: newRole
            });

            // Reset form
            setNewName('');
            setNewEmail('');
            setNewPass('');
            setNewRole('AGENTE');

            // Reload list
            loadUsers();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-5">Cargando...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Usuarios</h1>
                    <p className="text-muted">Administra el acceso a la plataforma.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

                {/* Lista de Usuarios */}
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Usuarios Activos</h2>
                    </div>
                    <div className="card-body p-0">
                        <table className="table" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Usuario</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Rol</th>
                                    <th style={{ textAlign: 'left', padding: '1rem' }}>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>{u.role}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {u.active ? (
                                                <span style={{ color: '#16a34a', fontSize: '0.9rem' }}>● Activo</span>
                                            ) : (
                                                <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>● Inactivo</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Formulario de Alta */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div className="card-header">
                        <h2 className="card-title">Nuevo Usuario</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="form-group mb-3">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    required
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    required
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Contraseña</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    required
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                />
                            </div>
                            <div className="form-group mb-4">
                                <label className="form-label">Rol</label>
                                <select
                                    className="form-control"
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value as UserRole)}
                                >
                                    {ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary w-100"
                                disabled={creating}
                            >
                                {creating ? 'Creando...' : 'Crear Usuario'}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}
