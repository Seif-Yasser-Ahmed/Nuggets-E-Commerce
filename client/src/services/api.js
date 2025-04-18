// client/src/services/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
});

// 🔐 Attach JWT token to every request (if exists)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle response errors, particularly token expiration (403 errors)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check specifically for token errors (403 Forbidden with "Invalid or expired token" message)
        if (error.response &&
            error.response.status === 403 &&
            error.response.data?.message === 'Invalid or expired token') {

            // Clear authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('user');

            // Create and dispatch an event to notify the app of logout
            window.dispatchEvent(new Event('auth-error'));
        }

        return Promise.reject(error);
    }
);

export default API;
