// client/src/routes/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import NotFound from '../pages/NotFound';


const AdminRoute = () => {
    const token = localStorage.getItem('token');

    // If no token at all, redirect to signin
    if (!token) return <Navigate to="/signin" replace />;

    try {
        const decoded = jwtDecode(token);

        // Check for token expiration
        if (!decoded.exp || Date.now() > decoded.exp * 1000) {
            // Token expired - clear auth data and redirect to login
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

        // Check for admin status - if not admin but token is valid, show 404
        if (!decoded.isAdmin) {
            // User is authenticated but not an admin, show 404
            return <NotFound />;
        }

        // User is authenticated and is an admin
        return <Outlet />;
    } catch (e) {
        console.error('Admin token validation error:', e);
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

export default AdminRoute;
