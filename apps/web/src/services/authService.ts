const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Error al iniciar sesión');
        }

        return res.json();
    },

    getUsers: async (token: string): Promise<User[]> => {
        const res = await fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error('Error al obtener usuarios');
        }

        return res.json();
    },

    createUser: async (token: string, userData: Partial<User> & { password: string }): Promise<User> => {
        const res = await fetch(`${API_URL}/users`, {
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
