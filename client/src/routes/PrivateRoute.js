import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/signin" replace />;

    try {
        // Check token expiration
        const decoded = jwtDecode(token);
        if (!decoded.exp || Date.now() > decoded.exp * 1000) {
            // Token expired or invalid, clear all auth data
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('user');
            localStorage.removeItem('userProfile');

            // Dispatch event to update components like navbar
            window.dispatchEvent(new CustomEvent('auth-status-changed'));

            return <Navigate to="/signin" replace />;
        }

        return <Outlet />;
    } catch (e) {
        console.error('Token validation error:', e);
        // Token decode failed, clear auth data and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('user');
        localStorage.removeItem('userProfile');
        window.dispatchEvent(new CustomEvent('auth-status-changed'));

        return <Navigate to="/signin" replace />;
    }
};

export default PrivateRoute;
