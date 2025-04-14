// client/src/services/authService.js
import API from './api';

export const signup = (userData) => {
    return API.post('/users/signup', userData);
};

export const signin = (credentials) => {
    return API.post('/users/signin', credentials);
};

export const getProfile = (userId) => {
    return API.get(`/users/profile/${userId}`);
};
