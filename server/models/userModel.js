const db = require('../db');

module.exports = {
    createUser: (username, hashedPassword, cb) => {
        const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
        db.query(query, [username, hashedPassword], cb);
    },

    getUserByUsername: (username, cb) => {
        const query = 'SELECT id, username, password, isAdmin FROM user WHERE username = ?';
        db.query(query, [username], cb);
    },

    getUserById: (id, cb) => {
        const query = 'SELECT id, username FROM user WHERE id = ?';
        db.query(query, [id], cb);
    },

    getAllUsers: (cb) => {
        const query = 'SELECT id, username FROM user';
        db.query(query, cb);
    },

    deleteUser: (id, cb) => {
        const query = 'DELETE FROM user WHERE id = ?';
        db.query(query, [id], cb);
    }
};