// src/services/inventoryService.js
import API from './api';

export const getInventory = () => {
    return API.get('/inventory');
};

export const updateInventory = (productId, inventoryData) => {
    return API.put(`/inventory/${productId}`, inventoryData);
};

export const getLowStockAlerts = () => {
    return API.get('/inventory/low-stock');
};
