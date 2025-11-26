import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
    const token = localStorage.getItem('token');
    console.log('ProtectedRoute check:', { token: !!token });

    if (!token) {
        console.log('No token found, redirecting to login...');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
