// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create an axios instance with base URL
const api = axios.create({
    baseURL: API_URL
});

// Request interceptor to add authorization header
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Handle 401 Unauthorized and 403 Forbidden responses
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // If not on login/signup pages and token exists, log out user
            const isAuthPage = window.location.pathname.includes('signin') || window.location.pathname.includes('signup');
            const token = localStorage.getItem('token');

            if (!isAuthPage && token) {
                // Clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                localStorage.removeItem('isAdmin');
                localStorage.removeItem('user');
                localStorage.removeItem('userProfile');

                // Dispatch auth change event
                window.dispatchEvent(new CustomEvent('auth-status-changed'));

                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/signin';
                }, 100);
            }
        }
        return Promise.reject(error);
    }
);

// Helper function to validate MongoDB ObjectId format
export const isValidObjectId = (id) => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(String(id));
};

// Helper function to ensure ID format is compatible with MongoDB
export const formatId = (id) => {
    if (!id) {
        console.error('Attempted to format undefined or null ID');
        return null;
    }

    // Handle objects that might have _id or id property
    if (typeof id === 'object' && id !== null) {
        if (id._id) return formatId(id._id);
        if (id.id) return formatId(id.id);
    }

    // Convert to string first to handle all input types
    const idString = String(id);

    // If it's already a valid ObjectId string, return as is
    if (isValidObjectId(idString)) {
        return idString;
    }

    // For backward compatibility with numeric IDs, 
    // you might want to use a placeholder ObjectId pattern or fetch the object first
    // For now, we'll return the string but log a warning
    console.warn(`ID ${idString} is not in valid MongoDB ObjectId format`);
    return idString;
};

export default api;
