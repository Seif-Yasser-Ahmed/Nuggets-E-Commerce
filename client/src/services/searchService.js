// src/services/searchService.js
import API from './api';

export const searchProducts = (query) => {
    return API.get('/products/search', { params: { query } });
};

export const filterProducts = (filters) => {
    // Expects filters as an object, e.g., { priceRange: '10-50', category: 'books' }
    return API.get('/products/filter', { params: filters });
};
