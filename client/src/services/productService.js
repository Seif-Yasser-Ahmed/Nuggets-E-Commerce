// src/services/productService.js
import API from './api';

export const getProducts = () => {
    return API.get('/products');
};

export const getProductById = (productId) => {
    return API.get(`/products/${productId}`);
};

export const addProduct = (productData) => {
    return API.post('/products', productData);
};

export const updateProduct = (productId, productData) => {
    return API.put(`/products/${productId}`, productData);
};

export const deleteProduct = (productId) => {
    return API.delete(`/products/${productId}`);
};
