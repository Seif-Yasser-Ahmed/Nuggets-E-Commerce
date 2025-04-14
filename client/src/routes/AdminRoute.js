// client/src/routes/AdminRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


const AdminRoute = () => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/signin" replace />;

    try {
        const { isAdmin, exp } = jwtDecode(token);
        if (!isAdmin || Date.now() > exp * 1000) return <Navigate to="/signin" replace />;
        return <Outlet />;
    } catch (e) {
        return <Navigate to="/signin" replace />;
    }
};

export default AdminRoute;
