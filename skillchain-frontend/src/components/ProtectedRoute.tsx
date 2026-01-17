import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        const token = localStorage.getItem('token');
        // If we have a token but user is null (loading), wait. 
        // If no token, redirect immediately.
        if (!token) return <Navigate to="/login" />;
        return <div className="text-center mt-20 text-white">Loading...</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
