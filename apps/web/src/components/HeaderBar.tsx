import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { ROLES } from "../config/roles";
import NotificationBell from "./NotificationsBell";
import logoInmovia from "../assets/logo-inmovia.png";

const HeaderBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsUserMenuOpen(false);
    };

    return (
        <header className="app-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 1.5rem',
            height: '64px',
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50
        }}>
            {/* Left: Logo & Title */}
            <div className="app-header__left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="app-header__logo" style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '4px'
                }}>
                    <img
                        src={logoInmovia}
                        alt="Logo"
                        style={{ height: '32px', width: '32px', objectFit: 'contain' }}
                    />
                </div>
                <span className="app-header__title" style={{
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    color: '#1e293b'
                }}>Inmovia Office</span>
            </div>

            {/* Right: Actions */}
            <div className="app-header__right" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                <NotificationBell />

                {/* User Button */}
                {user && (
                    <div className="user-menu-container" ref={userMenuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '6px',
                                transition: 'opacity 0.2s'
                            }}
                            className="user-menu-btn"
                        >
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{user.name}</span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.role}</span>
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                color: '#2563eb',
                                border: '1px solid #dbeafe'
                            }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        {/* Dropdown */}
                        {isUserMenuOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    width: '220px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                    border: '1px solid #e2e8f0',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    padding: '4px'
                                }}
                            >
                                <button
                                    onClick={() => handleNavigate('/perfil')}
                                    style={{ padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', width: '100%', borderRadius: '6px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Mi Perfil
                                </button>

                                <button
                                    onClick={() => handleNavigate('/configuracion')}
                                    style={{ padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', width: '100%', borderRadius: '6px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Configuración
                                </button>

                                {user.role === ROLES.OWNER && (
                                    <button
                                        onClick={() => handleNavigate('/usuarios')}
                                        style={{ padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#334155', width: '100%', borderRadius: '6px' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        Usuarios
                                    </button>
                                )}

                                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

                                <button
                                    onClick={handleLogout}
                                    style={{ padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', color: '#ef4444', width: '100%', borderRadius: '6px' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default HeaderBar;
