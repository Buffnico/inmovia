import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authService';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { token, user } = await AuthService.login(email, password);

            // Guardar sesión
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            console.log('Login exitoso, redirigiendo...');

            // Forzar navegación segura
            const origin = window.location.origin;
            // Usamos assign para asegurar que el navegador procese el cambio de URL
            window.location.assign(`${origin}/#/dashboard`);
            // No llamamos a reload() aquí porque podría recargar /login antes de cambiar la URL
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: '#f1f5f9'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="brand-title" style={{ fontSize: '1.8rem' }}>Inmovia Office</h1>
                    <p className="text-muted">Ingresá a tu oficina digital</p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{
                        background: '#fee2e2',
                        color: '#b91c1c',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
