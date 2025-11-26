import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Role } from '../config/roles';

interface RoleRouteProps {
    allowedRoles: Role[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role as Role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default RoleRoute;
