// src/services/productService.js
import api, { formatId } from './api';

// Get all products
export const getProducts = async () => {
    try {
        console.log('Calling products API endpoint');
        const response = await api.get('/products');
        console.log('Raw API response:', response);

        // Check if we have the expected response structure
        if (response && response.data) {
            // Sometimes the data is nested inside a 'data' property, handle both cases
            if (response.data.data) {
                console.log('Products found in response.data.data:', response.data.data.length);
                return {
                    data: response.data.data
                };
            } else {
                console.log('Products found in response.data:', response.data.length);
                return {
                    data: response.data
                };
            }
        }

        console.error('Unexpected API response format:', response);
        return { data: [] };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Get products by category
export const getProductsByCategory = async (category) => {
    try {
        const response = await api.get(`/products/category/${category}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        throw error;
    }
};

// Get all product categories
export const getCategories = async () => {
    try {
        const response = await api.get('/products/categories');
        return response.data;
    } catch (error) {
        console.error('Error fetching product categories:', error);
        throw error;
    }
};

// Get a single product by ID
export const getProductById = async (id) => {
    try {
        // Enhanced validation for product ID
        if (!id || id === 'undefined' || id === 'null') {
            console.error('Invalid product ID requested:', id);
            throw new Error('Invalid product ID');
        }
        
        // Format the ID properly for MongoDB
        const formattedId = formatId(id);
        
        if (!formattedId) {
            console.error('Failed to format product ID:', id);
            throw new Error('Invalid product ID format');
        }
        
        const response = await api.get(`/products/${formattedId}`);
        
        // Ensure we have valid data
        if (!response.data || (!response.data.data && !response.data._id && !response.data.id)) {
            console.error('Invalid product data received:', response.data);
            throw new Error('Invalid product data received from server');
        }
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
    }
};

// Add a new product (admin only)
export const addProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

// Update a product (admin only)
export const updateProduct = async (id, productData) => {
    try {
        const formattedId = formatId(id);
        const response = await api.put(`/products/${formattedId}`, productData);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${id}:`, error);
        throw error;
    }
};

// Delete a product (admin only)
export const deleteProduct = async (id) => {
    try {
        const formattedId = formatId(id);
        const response = await api.delete(`/products/${formattedId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting product ${id}:`, error);
        throw error;
    }
};

// Upload product image
export const uploadProductImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/products/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};
