import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useOffice } from '../context/OfficeContext';

interface ModuleRouteProps {
    module: string;
}

const ModuleRoute: React.FC<ModuleRouteProps> = ({ module }) => {
    const { officeConfig, loading } = useOffice();

    if (loading) return <div>Cargando...</div>;

    if (officeConfig && officeConfig.modules && !officeConfig.modules[module]) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ModuleRoute;
