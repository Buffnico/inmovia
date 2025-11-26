import React, { createContext, useContext, useState, useEffect } from 'react';
import ProfileService from '../services/profileService';
import { useAuth } from '../store/auth';

interface OfficeConfig {
    modules: {
        properties: boolean;
        agenda: boolean;
        contacts: boolean;
        whatsapp: boolean;
        edu: boolean;
        scanner: boolean;
        social: boolean;
        ivot: boolean;
        [key: string]: boolean;
    };
    [key: string]: any;
}

interface OfficeContextType {
    officeConfig: OfficeConfig | null;
    loading: boolean;
    refreshConfig: () => Promise<void>;
}

const OfficeContext = createContext<OfficeContextType>({
    officeConfig: null,
    loading: true,
    refreshConfig: async () => { },
});

export const useOffice = () => useContext(OfficeContext);

export const OfficeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [officeConfig, setOfficeConfig] = useState<OfficeConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    const fetchConfig = async () => {
        try {
            // We use a public endpoint or the profile endpoint.
            // Since the requirement says "any authenticated user", we can use getOfficeConfig
            // BUT getOfficeConfig in backend is currently restricted to OWNER.
            // We need to check if we should modify backend or use a different approach.
            // The prompt says: "El endpoint de lectura... Permitir lectura a cualquier usuario autenticado".
            // So I should have updated the backend controller too!
            // Let's assume I will update the backend controller in a moment.
            const config = await ProfileService.getOfficeConfig();
            setOfficeConfig(config);
        } catch (error) {
            console.error("Failed to load office config", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchConfig();
        } else {
            setLoading(false);
            setOfficeConfig(null);
        }
    }, [isAuthenticated]);

    return (
        <OfficeContext.Provider value={{ officeConfig, loading, refreshConfig: fetchConfig }}>
            {children}
        </OfficeContext.Provider>
    );
};
