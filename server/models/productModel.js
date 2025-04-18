const db = require('../db');

module.exports = {
    createProduct: (product, callback) => {
        const { name, description, price, category, image_url, stock, discount, specs } = product;
        const query = `
            INSERT INTO product (name, description, price, category, image_url, stock, discount, specs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [name, description, price, category, image_url, stock, discount, JSON.stringify(specs)], callback);
    },

    getProductById: (id, callback) => {
        const query = 'SELECT * FROM product WHERE id = ?';
        db.query(query, [id], callback);
    },

    getAllProducts: (callback) => {
        const query = 'SELECT * FROM product';
        db.query(query, callback);
    },

    getProductsByCategory: (category, callback) => {
        const query = 'SELECT * FROM product WHERE category = ?';
        db.query(query, [category], callback);
    },

    updateProduct: (id, product, callback) => {
        const { name, description, price, category, image_url, stock, discount, specs } = product;
        const query = `
            UPDATE product 
            SET name = ?, description = ?, price = ?, category = ?, 
                image_url = ?, stock = ?, discount = ?, specs = ?
            WHERE id = ?
        `;
        db.query(
            query,
            [name, description, price, category, image_url, stock, discount, JSON.stringify(specs), id],
            callback
        );
    },

    deleteProduct: (id, callback) => {
        const query = 'DELETE FROM product WHERE id = ?';
        db.query(query, [id], callback);
    },

    getCategories: (callback) => {
        const query = 'SELECT DISTINCT category FROM product';
        db.query(query, callback);
    },

    getLowStock: (threshold, callback) => {
        const query = 'SELECT * FROM product WHERE stock <= ?';
        db.query(query, [threshold], callback);
    }
};