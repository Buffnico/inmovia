import { apiFetch } from './apiClient';

export type UserRole = 'OWNER' | 'ADMIN' | 'MARTILLERO' | 'AGENTE' | 'RECEPCIONISTA' | 'OTRO';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    createdAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

const AuthService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        try {
            const res = await apiFetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.message || 'Error al iniciar sesión. Verificá tus credenciales.');
            }

            return res.json();
        } catch (error: any) {
            console.error("Login error:", error);
            if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                throw new Error('No se pudo conectar con el servidor. Verificá tu conexión o el estado de la API.');
            }
            throw error;
        }
    },

    getUsers: async (token: string): Promise<User[]> => {
        // apiFetch automatically adds Authorization header if token is in localStorage
        // But here we accept token as arg. Let's override.
        const res = await apiFetch('/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Error al obtener usuarios');
        }

        return res.json();
    },

    createUser: async (token: string, userData: Partial<User> & { password: string }): Promise<User> => {
        const res = await apiFetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Error al crear usuario');
        }

        return res.json();
    }
};

export default AuthService;
